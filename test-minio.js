const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minio',
  secretKey: 'minio12345',
});

const bucketName = 'legal-documents';

async function testMinio() {
  try {
    console.log('Testing MinIO connection...');
    
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    console.log(`Bucket '${bucketName}' exists:`, bucketExists);
    
    if (!bucketExists) {
      console.log('Creating bucket...');
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log('Bucket created successfully');
    }
    
    // Test upload
    const testData = Buffer.from('This is a test document');
    const objectName = 'test/test-document.txt';
    
    console.log('Testing file upload...');
    await minioClient.putObject(
      bucketName,
      objectName,
      testData,
      testData.length,
      { 'Content-Type': 'text/plain' }
    );
    console.log('File uploaded successfully');
    
    // Test download
    console.log('Testing file download...');
    const stream = await minioClient.getObject(bucketName, objectName);
    const chunks = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        const data = Buffer.concat(chunks);
        console.log('File downloaded successfully, content:', data.toString());
        resolve();
      });
      stream.on('error', reject);
    });
    
  } catch (error) {
    console.error('MinIO test failed:', error);
  }
}

testMinio();
