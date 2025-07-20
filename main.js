import OpenScad from "./openscad.wasm.js";

const spinnerOverlay = document.getElementById('spinner-overlay');
const spinnerText = document.getElementById('spinner-text');

const parametersForm = document.getElementById('parameters-form');

function showSpinner(text = 'Пожалуйста, подождите...') {
    spinnerText.textContent = text;
    spinnerOverlay.classList.remove('hidden');
}

function hideSpinner() {
    spinnerOverlay.classList.add('hidden');
}

function updateSpinnerText(text) {
    spinnerText.textContent = text;
    void spinnerText.offsetHeight;
}

async function getBookCoverCode() {
    const bookCoverCodeUrl = new URL(`./book_cover.scad`, import.meta.url).href;
    const request = await fetch(bookCoverCodeUrl);
    return await request.text();
}

async function startAsyncOperation(waitingText, asyncOperation) {
    try {
        showSpinner();
        const result = await simulateAsyncOperation();
        alert(result);
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    } finally {
        hideSpinner();
    }
}
    
async function getOpenScad() {
    let resolver;
    let getOpenScadPromise =  new Promise((resolve) => {
        resolver = resolve;
    });

    let options = { 
        noInitialRun: true,
        noExitRuntime: true,
        onRuntimeInitialized: () => {
            resolver(null)
        }
    }

    let instance = await OpenScad(options);
    
    await getOpenScadPromise;

    return instance;
}

function downloadFile(blob, fileName) {
    const downloadLinkParent = document.getElementById("download_link_parent");
    downloadLinkParent.innerHTML = '';

    const link = document.createElement('a');
    downloadLinkParent.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.textContent="Download model";
    
    const stlContent = document.getElementById("stl_cont");
    stlContent.innerHTML = '';
    let book_cover_model =  {
        id: 0,
        filename: link.href,
        animation: {
            delta:  {
                rotationx: 1, 
                rotationy: 1,
                rotationz: 1,  
                msec: 10000, 
                loop: true
            }
        }
    }

    new StlViewer(stlContent, { models: [book_cover_model] });
}

function generateModel(openScad, bookCoverCode) {
    openScad.FS.writeFile("/input.scad", bookCoverCode);
    openScad.callMain(["/input.scad", "--backend=manifold", "-o", "book_cover.stl"]);
    const output = openScad.FS.readFile("/book_cover.stl");

    downloadFile(new Blob([output], { type: "application/octet-stream" }), "book_cover.stl");
}

async function run(modelParameters) {
    try {
        showSpinner('Load OpenScad wasm...');
        const openScad = await getOpenScad();
        updateSpinnerText('Generate book cover...');
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const bookCoverCodeTemplate = await getBookCoverCode();

        const bookCoverCode = bookCoverCodeTemplate.replace("__length__", modelParameters.length)
            .replace("__length__", modelParameters.length)
            .replace("__depth__", modelParameters.depth)
            .replace("__height__", modelParameters.height)
            .replace("__thickness__", modelParameters.thickness)
            .replace("__offset__", modelParameters.offset)
            .replace("__hex_radius__", modelParameters.hexRadius);

        generateModel(openScad, bookCoverCode);
    } catch (error) {
        console.error('Ошибка:', error);
            throw error;
        } finally {
            hideSpinner();
        }
}

// Обработка отправки формы
parametersForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Собираем данные формы
    const formData = new FormData(parametersForm);
    const inputData = {
    length: parseFloat(formData.get('length')),
    depth: parseFloat(formData.get('depth')),
    height: parseFloat(formData.get('height')),
    thickness: parseFloat(formData.get('thickness')),
    offset: parseFloat(formData.get('offset')),
    hexRadius: parseFloat(formData.get('hex_radius'))
    };
    
    await run(inputData);
});