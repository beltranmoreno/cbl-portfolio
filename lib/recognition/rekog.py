# Complete Photo Archive System with AWS Rekognition
# Best-in-class face recognition + scene detection + easy tagging

import boto3
import json
from datetime import datetime
import os

# Initialize AWS clients
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

BUCKET_NAME = 'photographer-negatives'
COLLECTION_ID = 'photographer-faces'

# ===== SETUP: Create Face Collection =====
def setup_face_collection():
    """Create a collection to store and search faces"""
    try:
        rekognition.create_collection(CollectionId=COLLECTION_ID)
        print(f"Created collection: {COLLECTION_ID}")
    except rekognition.exceptions.ResourceAlreadyExistsException:
        print(f"Collection {COLLECTION_ID} already exists")

# ===== STEP 1: Upload and Analyze Photos =====
def upload_and_analyze_photo(image_path, metadata=None):
    """
    Upload photo to S3 and analyze with Rekognition
    Returns comprehensive analysis including faces, labels, text
    """
    filename = os.path.basename(image_path)
    
    # 1. Upload to S3
    s3.upload_file(image_path, BUCKET_NAME, filename)
    print(f"Uploaded: {filename}")
    
    # 2. Detect labels (objects, scenes, activities)
    labels_response = rekognition.detect_labels(
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': filename}},
        MaxLabels=50,
        MinConfidence=70
    )
    
    # 3. Detect faces and index them for searching
    faces_response = rekognition.index_faces(
        CollectionId=COLLECTION_ID,
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': filename}},
        ExternalImageId=filename,
        DetectionAttributes=['ALL'],
        MaxFaces=10,
        QualityFilter='AUTO'
    )
    
    # 4. Detect text in image
    text_response = rekognition.detect_text(
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': filename}}
    )
    
    # 5. Detect celebrities (if any)
    celebrity_response = rekognition.recognize_celebrities(
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': filename}}
    )
    
    # Compile analysis
    analysis = {
        'filename': filename,
        's3_url': f"s3://{BUCKET_NAME}/{filename}",
        'upload_date': datetime.now().isoformat(),
        'metadata': metadata or {},
        
        # Scene and object labels
        'labels': [
            {
                'name': label['Name'],
                'confidence': label['Confidence'],
                'categories': [cat['Name'] for cat in label.get('Categories', [])]
            }
            for label in labels_response['Labels']
        ],
        
        # Faces detected
        'faces': [
            {
                'face_id': face['Face']['FaceId'],
                'confidence': face['Face']['Confidence'],
                'bounding_box': face['Face']['BoundingBox'],
                'quality': face['FaceDetail']['Quality'],
                'emotions': face['FaceDetail'].get('Emotions', []),
                'age_range': face['FaceDetail'].get('AgeRange', {}),
                'gender': face['FaceDetail'].get('Gender', {}),
                'person_name': None  # To be tagged later
            }
            for face in faces_response['FaceRecords']
        ],
        
        # Text found in image
        'text': [
            {
                'text': text['DetectedText'],
                'confidence': text['Confidence'],
                'type': text['Type']  # LINE or WORD
            }
            for text in text_response.get('TextDetections', [])
            if text['Type'] == 'LINE'  # Only get full lines
        ],
        
        # Celebrities
        'celebrities': [
            {
                'name': celeb['Name'],
                'confidence': celeb['MatchConfidence']
            }
            for celeb in celebrity_response.get('CelebrityFaces', [])
        ]
    }
    
    # 6. Store in DynamoDB for easy querying
    table = dynamodb.Table('PhotoArchive')
    table.put_item(Item=json.loads(json.dumps(analysis), parse_float=str))
    
    return analysis

# ===== STEP 2: Easy Face Tagging Interface =====
def get_untagged_faces(limit=50):
    """Get faces that haven't been tagged with names yet"""
    table = dynamodb.Table('PhotoArchive')
    
    response = table.scan(
        FilterExpression='attribute_exists(faces)'
    )
    
    untagged = []
    for item in response['Items']:
        for face in item.get('faces', []):
            if not face.get('person_name'):
                untagged.append({
                    'filename': item['filename'],
                    's3_url': item['s3_url'],
                    'face_id': face['face_id'],
                    'bounding_box': face['bounding_box'],
                    'age_range': face.get('age_range'),
                    'gender': face.get('gender')
                })
                
                if len(untagged) >= limit:
                    return untagged
    
    return untagged

def tag_face(face_id, person_name):
    """Tag a face with a person's name"""
    table = dynamodb.Table('PhotoArchive')
    
    # Find the photo containing this face
    response = table.scan()
    
    for item in response['Items']:
        for i, face in enumerate(item.get('faces', [])):
            if face['face_id'] == face_id:
                # Update the face with person name
                face['person_name'] = person_name
                
                # Update in DynamoDB
                table.update_item(
                    Key={'filename': item['filename']},
                    UpdateExpression=f'SET faces[{i}].person_name = :name',
                    ExpressionAttributeValues={':name': person_name}
                )
                
                print(f"Tagged face {face_id} as {person_name}")
                return True
    
    return False

def tag_similar_faces(reference_face_id, person_name, similarity_threshold=90):
    """
    Find all similar faces to a reference face and tag them
    Great for batch tagging the same person across multiple photos
    """
    # Search for similar faces in the collection
    response = rekognition.search_faces(
        CollectionId=COLLECTION_ID,
        FaceId=reference_face_id,
        FaceMatchThreshold=similarity_threshold,
        MaxFaces=100
    )
    
    # Tag all matching faces
    tagged_count = 0
    for match in response['FaceMatches']:
        face_id = match['Face']['FaceId']
        if tag_face(face_id, person_name):
            tagged_count += 1
    
    print(f"Tagged {tagged_count} faces as {person_name}")
    return tagged_count

# ===== STEP 3: Search Functions =====
def search_by_label(label_name, min_confidence=80):
    """
    Search photos by what's in them
    Examples: 'beach', 'wedding', 'car', 'sunset', 'dancing'
    """
    table = dynamodb.Table('PhotoArchive')
    
    response = table.scan()
    
    results = []
    for item in response['Items']:
        for label in item.get('labels', []):
            if label['name'].lower() == label_name.lower() and label['confidence'] >= min_confidence:
                results.append({
                    'filename': item['filename'],
                    's3_url': item['s3_url'],
                    'confidence': label['confidence'],
                    'all_labels': [l['name'] for l in item['labels'][:10]]
                })
                break
    
    return results

def search_by_person(person_name):
    """Find all photos containing a specific person"""
    table = dynamodb.Table('PhotoArchive')
    
    response = table.scan()
    
    results = []
    for item in response['Items']:
        for face in item.get('faces', []):
            if face.get('person_name', '').lower() == person_name.lower():
                results.append({
                    'filename': item['filename'],
                    's3_url': item['s3_url'],
                    'face_details': face
                })
                break
    
    return results

def search_by_face_photo(reference_image_path, similarity_threshold=80):
    """
    Upload a photo of someone and find all photos containing them
    Perfect for: "Who is this person? Show me all their photos"
    """
    # Upload reference image temporarily
    temp_filename = 'temp_reference.jpg'
    s3.upload_file(reference_image_path, BUCKET_NAME, temp_filename)
    
    # Detect face in reference image
    response = rekognition.detect_faces(
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': temp_filename}},
        Attributes=['ALL']
    )
    
    if not response['FaceDetails']:
        return []
    
    # Search by this face
    search_response = rekognition.search_faces_by_image(
        CollectionId=COLLECTION_ID,
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': temp_filename}},
        FaceMatchThreshold=similarity_threshold,
        MaxFaces=100
    )
    
    # Get filenames from matches
    results = []
    for match in search_response['FaceMatches']:
        external_image_id = match['Face']['ExternalImageId']
        results.append({
            'filename': external_image_id,
            'similarity': match['Similarity'],
            's3_url': f"s3://{BUCKET_NAME}/{external_image_id}"
        })
    
    # Clean up temp file
    s3.delete_object(Bucket=BUCKET_NAME, Key=temp_filename)
    
    return results

def search_by_text(text_query):
    """Find photos containing specific text (signs, documents, etc.)"""
    table = dynamodb.Table('PhotoArchive')
    
    response = table.scan()
    
    results = []
    for item in response['Items']:
        for text in item.get('text', []):
            if text_query.lower() in text['text'].lower():
                results.append({
                    'filename': item['filename'],
                    's3_url': item['s3_url'],
                    'text_found': text['text'],
                    'confidence': text['confidence']
                })
                break
    
    return results

def search_by_location(location_name):
    """Search by location from metadata"""
    table = dynamodb.Table('PhotoArchive')
    
    response = table.scan(
        FilterExpression='contains(metadata.#loc, :location)',
        ExpressionAttributeNames={'#loc': 'location'},
        ExpressionAttributeValues={':location': location_name}
    )
    
    return response['Items']

def advanced_search(labels=None, people=None, text=None, location=None, date_range=None):
    """
    Combined search across multiple criteria
    Example: Find photos of "John Smith" at "beach" from "1985"
    """
    table = dynamodb.Table('PhotoArchive')
    response = table.scan()
    
    results = []
    for item in response['Items']:
        match = True
        
        # Check labels
        if labels:
            item_labels = [l['name'].lower() for l in item.get('labels', [])]
            if not any(label.lower() in item_labels for label in labels):
                match = False
        
        # Check people
        if people and match:
            item_people = [f.get('person_name', '').lower() for f in item.get('faces', [])]
            if not any(person.lower() in item_people for person in people):
                match = False
        
        # Check text
        if text and match:
            item_text = ' '.join([t['text'] for t in item.get('text', [])]).lower()
            if text.lower() not in item_text:
                match = False
        
        # Check location
        if location and match:
            item_location = item.get('metadata', {}).get('location', '').lower()
            if location.lower() not in item_location:
                match = False
        
        if match:
            results.append(item)
    
    return results

# ===== STEP 4: Batch Processing =====
def batch_process_directory(directory_path, metadata_csv=None):
    """Process entire directory of photos"""
    import pandas as pd
    
    metadata_df = None
    if metadata_csv:
        metadata_df = pd.read_csv(metadata_csv)
    
    for filename in os.listdir(directory_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.tif', '.tiff')):
            image_path = os.path.join(directory_path, filename)
            
            metadata = {}
            if metadata_df is not None:
                row = metadata_df[metadata_df['filename'] == filename]
                if not row.empty:
                    metadata = row.iloc[0].to_dict()
            
            try:
                analysis = upload_and_analyze_photo(image_path, metadata)
                print(f"✓ Processed: {filename}")
                print(f"  - Found {len(analysis['faces'])} faces")
                print(f"  - Detected {len(analysis['labels'])} labels")
                if analysis['celebrities']:
                    print(f"  - Celebrities: {[c['name'] for c in analysis['celebrities']]}")
            except Exception as e:
                print(f"✗ Error processing {filename}: {e}")

# ===== USAGE EXAMPLES =====
if __name__ == "__main__":
    # Setup
    setup_face_collection()
    
    # Process photos
    # batch_process_directory('/path/to/negatives', 'metadata.csv')
    
    # Search examples
    beach_photos = search_by_label('beach')
    wedding_photos = search_by_label('wedding')
    john_photos = search_by_person('John Smith')
    
    # Find person from a reference photo
    matches = search_by_face_photo('reference_photo.jpg')
    
    # Advanced search
    results = advanced_search(
        labels=['beach', 'sunset'],
        people=['John Smith'],
        location='California'
    )
    
    # Easy tagging workflow
    untagged = get_untagged_faces(limit=10)
    # Show these to user, they identify person
    tag_face(untagged[0]['face_id'], 'John Smith')
    # Auto-tag similar faces
    tag_similar_faces(untagged[0]['face_id'], 'John Smith', similarity_threshold=90)