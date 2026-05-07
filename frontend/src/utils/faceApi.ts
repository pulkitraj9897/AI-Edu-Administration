import * as faceapi from 'face-api.js';

/**
 * Loads the required pre-trained neural network models for face detection and recognition.
 * Models must be located in the public/models directory.
 */
export const loadModels = async () => {
  const MODEL_URL = '/models';
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    console.log("FaceAPI models loaded successfully.");
  } catch (error) {
    console.error("Error loading FaceAPI models:", error);
  }
};

/**
 * Extracts a 128-dimensional face descriptor array from a given image Data URL.
 * @param imageUrl Base64 Data URL of the image
 * @returns Array of 128 numbers representing the face, or null if no face detected.
 */
export const extractFaceDescriptor = async (imageUrl: string): Promise<number[] | null> => {
  try {
    const img = document.createElement('img');
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Failed to load image for face extraction"));
      img.src = imageUrl;
    });

    // Detect a single face, get its landmarks, and extract the mathematical descriptor
    const detection = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
      
    if (detection) {
      // Convert Float32Array to standard JS Array for JSON serialization
      return Array.from(detection.descriptor);
    }
    return null;
  } catch (err) {
    console.error("Face extraction error details:", err);
    throw err;
  }
};
