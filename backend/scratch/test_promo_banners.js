const fs = require('fs');
const path = require('path');

async function testPromoBanners() {
  try {
    console.log("=== Testing Admin Login ===");
    const loginRes = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ddcosmetics.com',
        password: 'adminpassword123'
      })
    });

    if (!loginRes.ok) {
      console.error("Login failed!");
      return;
    }

    const { token } = await loginRes.json();
    console.log("Login successful. Token obtained:", token.substring(0, 15) + "...");

    console.log("\n=== Testing POST /api/promo-banners (Create Banner) ===");
    // Create a mock image file for uploading
    const mockImagePath = path.join(__dirname, 'mock_banner.jpg');
    fs.writeFileSync(mockImagePath, 'fake-image-content');

    const formData = new FormData();
    formData.append('title', 'Summer Glow Sale');
    formData.append('subtitle', 'Get up to 50% Off');
    formData.append('buttonText', 'Explore Now');
    formData.append('link', '/shop?category=skincare');
    formData.append('isActive', 'true');
    formData.append('order', '1');

    // Fetch API handles FormData automatically.
    // Note: Node.js fetch needs file read stream or Blob.
    const fileBlob = new Blob([fs.readFileSync(mockImagePath)], { type: 'image/jpeg' });
    formData.append('image', fileBlob, 'mock_banner.jpg');

    const createRes = await fetch('http://localhost:5000/api/promo-banners', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    // Cleanup mock file
    if (fs.existsSync(mockImagePath)) fs.unlinkSync(mockImagePath);

    const bannerData = await createRes.json();
    if (!createRes.ok) {
      console.error("Create banner failed:", bannerData);
      return;
    }
    console.log("Banner created successfully:", bannerData);
    const bannerId = bannerData._id;

    console.log("\n=== Testing GET /api/promo-banners (Public list) ===");
    const publicListRes = await fetch('http://localhost:5000/api/promo-banners');
    const publicBanners = await publicListRes.json();
    console.log(`Found ${publicBanners.length} active banners.`);
    console.log(publicBanners);

    console.log("\n=== Testing PUT /api/promo-banners/:id (Update Banner) ===");
    // We will do a JSON update to toggle isActive to false and update title
    const updateRes = await fetch(`http://localhost:5000/api/promo-banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Updated Summer Glow Sale',
        isActive: false
      })
    });
    const updatedBanner = await updateRes.json();
    console.log("Banner updated successfully:", updatedBanner);

    console.log("\n=== Testing GET /api/promo-banners/admin (Admin list) ===");
    const adminListRes = await fetch('http://localhost:5000/api/promo-banners/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const adminBanners = await adminListRes.json();
    console.log(`Found ${adminBanners.length} total banners (admin view).`);

    console.log("\n=== Testing DELETE /api/promo-banners/:id (Delete Banner) ===");
    const deleteRes = await fetch(`http://localhost:5000/api/promo-banners/${bannerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    console.log("Delete response:", deleteData);

  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

testPromoBanners();
