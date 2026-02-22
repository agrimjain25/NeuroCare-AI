const API_KEY = "AIzaSyBW1FDFwCGCR65TsLIAtW_QEOfJ0zQnGPU";

async function listModels() {
  console.log("Listing available Gemini models...");
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    if (response.status === 200) {
      console.log("Models found:", data.models.length);
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log(`Error: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.log(`Fetch error: ${e.message}`);
  }
}

listModels();
