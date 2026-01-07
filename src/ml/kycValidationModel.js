/**
 * KYC Document Verification Model (Local CV Rules)
 * Simulated computer vision logic for document validation
 */

export const kycValidationModel = {
  /**
   * Validate KYC images
   * @param {Object} images - Front, back, and selfie images
   * @returns {Object} - Validation results
   */
  validateKYCImages: (images) => {
    const { front, back, selfie } = images;

    // Simulated image analysis results
    const results = {
      front: {
        blurScore: Math.random() * 0.3, // 0-0.3 (low blur = good)
        brightness: 0.5 + Math.random() * 0.3, // 0.5-0.8 (good range)
        contrast: 0.6 + Math.random() * 0.2, // 0.6-0.8 (good)
        textReadability: 0.7 + Math.random() * 0.2, // 0.7-0.9 (good)
        faceDetected: Math.random() > 0.1, // 90% chance
        documentType: 'CNIC', // Detected type
        isValid: true,
      },
      back: {
        blurScore: Math.random() * 0.3,
        brightness: 0.5 + Math.random() * 0.3,
        contrast: 0.6 + Math.random() * 0.2,
        textReadability: 0.7 + Math.random() * 0.2,
        isValid: true,
      },
      selfie: {
        blurScore: Math.random() * 0.4, // Slightly higher for selfies
        brightness: 0.5 + Math.random() * 0.3,
        faceDetected: Math.random() > 0.15, // 85% chance
        faceMatch: Math.random() > 0.2, // 80% match with ID
        quality: 0.6 + Math.random() * 0.3,
        isValid: true,
      }
    };

    // Validation rules
    const validations = {
      frontBlur: results.front.blurScore < 0.25,
      frontBrightness: results.front.brightness > 0.4 && results.front.brightness < 0.9,
      frontContrast: results.front.contrast > 0.5,
      frontTextReadable: results.front.textReadability > 0.6,
      frontFaceDetected: results.front.faceDetected,
      
      backBlur: results.back.blurScore < 0.25,
      backBrightness: results.back.brightness > 0.4 && results.back.brightness < 0.9,
      backContrast: results.back.contrast > 0.5,
      backTextReadable: results.back.textReadability > 0.6,
      
      selfieBlur: results.selfie.blurScore < 0.35,
      selfieBrightness: results.selfie.brightness > 0.4 && results.selfie.brightness < 0.9,
      selfieFaceDetected: results.selfie.faceDetected,
      selfieFaceMatch: results.selfie.faceMatch,
      selfieQuality: results.selfie.quality > 0.5,
    };

    // Calculate overall scores
    const frontScore = (
      (validations.frontBlur ? 1 : 0) * 0.25 +
      (validations.frontBrightness ? 1 : 0) * 0.15 +
      (validations.frontContrast ? 1 : 0) * 0.15 +
      (validations.frontTextReadable ? 1 : 0) * 0.30 +
      (validations.frontFaceDetected ? 1 : 0) * 0.15
    );

    const backScore = (
      (validations.backBlur ? 1 : 0) * 0.25 +
      (validations.backBrightness ? 1 : 0) * 0.15 +
      (validations.backContrast ? 1 : 0) * 0.15 +
      (validations.backTextReadable ? 1 : 0) * 0.45
    );

    const selfieScore = (
      (validations.selfieBlur ? 1 : 0) * 0.20 +
      (validations.selfieBrightness ? 1 : 0) * 0.15 +
      (validations.selfieFaceDetected ? 1 : 0) * 0.30 +
      (validations.selfieFaceMatch ? 1 : 0) * 0.25 +
      (validations.selfieQuality ? 1 : 0) * 0.10
    );

    const overallScore = (frontScore + backScore + selfieScore) / 3;

    // Determine validation status
    let status, statusLabel;
    if (overallScore >= 0.9) {
      status = 'approved';
      statusLabel = 'Approved';
    } else if (overallScore >= 0.7) {
      status = 'hold';
      statusLabel = 'Under Review';
    } else {
      status = 'rejected';
      statusLabel = 'Rejected';
    }

    // Collect issues
    const issues = [];
    if (!validations.frontBlur) issues.push('Front ID image is blurred');
    if (!validations.frontTextReadable) issues.push('Front ID text is not readable');
    if (!validations.frontFaceDetected) issues.push('No face detected in front ID');
    if (!validations.backBlur) issues.push('Back ID image is blurred');
    if (!validations.backTextReadable) issues.push('Back ID text is not readable');
    if (!validations.selfieBlur) issues.push('Selfie image is blurred');
    if (!validations.selfieFaceDetected) issues.push('No face detected in selfie');
    if (!validations.selfieFaceMatch) issues.push('Selfie face does not match ID photo');

    return {
      overallScore: parseFloat(overallScore.toFixed(3)),
      status,
      statusLabel,
      frontScore: parseFloat(frontScore.toFixed(3)),
      backScore: parseFloat(backScore.toFixed(3)),
      selfieScore: parseFloat(selfieScore.toFixed(3)),
      results,
      validations,
      issues: issues.length > 0 ? issues : ['All validations passed'],
      recommendations: status === 'rejected' 
        ? ['Please retake images with better lighting', 'Ensure images are clear and in focus', 'Make sure face is clearly visible']
        : status === 'hold'
        ? ['Images are being reviewed', 'You will be notified of the result']
        : ['KYC verification successful']
    };
  }
};

