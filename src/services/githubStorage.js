const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN || '';
const GITHUB_OWNER = 'Phusssss';
const GITHUB_REPO = 'task-files';

export const githubStorage = {
  async uploadImage(file, folder = 'images') {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      const fileName = `${folder}/${Date.now()}_${file.name || 'image.jpg'}`;
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Upload image: ${file.name}`,
            content: base64.split(',')[1],
            branch: 'main'
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API Response:', response.status, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // Return raw GitHub URL for better performance
      const downloadURL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${fileName}`;
      console.log('GitHub upload success, returning URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('GitHub upload error:', error);
      throw error;
    }
  },

  async deleteImage(fileName) {
    try {
      // Get file SHA first
      const getResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!getResponse.ok) {
        throw new Error('File not found');
      }

      const fileData = await getResponse.json();
      
      // Delete file
      const deleteResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Delete image: ${fileName}`,
            sha: fileData.sha,
            branch: 'main'
          })
        }
      );

      return deleteResponse.ok;
    } catch (error) {
      console.error('GitHub delete error:', error);
      return false;
    }
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Get raw GitHub URL for better performance
  getRawUrl(downloadUrl) {
    return downloadUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
};