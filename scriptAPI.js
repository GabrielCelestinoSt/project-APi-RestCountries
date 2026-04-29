const API_url = 'https://restcountries.com/v3.1/all?fields=name,capital,translations,flags,cca3,region,subregion,population,continents,latlng';

let allCountries = [];
let mapInstance = null; 

async function buscarPaises() {
    console.log("Tentando acessar:", API_url);
    try {
        const response = await fetch(API_url);
        allCountries = await response.json();
    } catch(error) {
        console.error("Erro ao buscar os países:", error);
        document.getElementById('content-container').innerHTML = `<p style="color:red">Falha ao carregar dados: ${error.message}</p>`;
    }
}

function toggleCountries(continenteNome, containerId) {
    const container = document.getElementById(containerId);
    
    if (!container.classList.contains('hidden')) {
        container.classList.add('hidden');
        return;
    }

    document.querySelectorAll('[id^="list-"]').forEach(el => el.classList.add('hidden'));

    const countriesFiltered = allCountries.filter(country => {
        const regionMatch = country.region === continenteNome;
        const continentMatch = country.continents.some(c => c.includes(continenteNome));
        return regionMatch || continentMatch;
    });

    countriesFiltered.sort((a, b) => a.translations.por?.common.localeCompare(b.translations.por?.common));

    if (countriesFiltered.length === 0) {
        container.innerHTML = `<div class="py-2 text-red-500">Nenhum país encontrado</div>`;
    } else {
 
        container.innerHTML = countriesFiltered.map(country => `
            <div onclick="showCountryDetails('${country.cca3}')" class="py-1 border-b border-gray-100 hover:text-green-600 cursor-pointer">
                ${country.translations.por?.common || country.name.common}
            </div>
        `).join('');
    }

    container.classList.remove('hidden');
}


function showCountryDetails(cca3) {
    const country = allCountries.find(c => c.cca3 === cca3);
    if (!country) return;

    const nomePT = country.translations.por?.common || country.name.common;
    const capital = country.capital && country.capital.length > 0 ? country.capital : 'Não informada';
    const populacao = country.population.toLocaleString('pt-BR');
    const lat = country.latlng[0];
    const lng = country.latlng[1];

    const contentContainer = document.getElementById('content-container');

    contentContainer.className = "w-full bg-gray-100 p-8 overflow-y-auto";

    contentContainer.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <div class="flex items-center gap-6 mb-6">
                <img src="${country.flags.svg}" class="w-40 h-auto border border-gray-200 shadow-sm rounded">
                <div>
                    <h2 class="text-4xl font-bold text-gray-800">${nomePT}</h2>
                    <p class="text-gray-500 text-lg mt-1">${country.region} ${country.subregion ? `> ${country.subregion}` : ''}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p class="text-sm text-green-700 uppercase font-bold tracking-wider">Capital</p>
                    <p class="text-xl text-gray-800 font-semibold mt-1">${capital}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p class="text-sm text-green-700 uppercase font-bold tracking-wider">População</p>
                    <p class="text-xl text-gray-800 font-semibold mt-1">${populacao}</p>
                </div>
            </div>

            <h3 class="text-xl font-bold text-gray-800 mb-2">Localização no Mapa</h3>
            <div id="map" class="min-h-74 w-full rounded-lg border border-gray-300 z-0"></div>
        </div>
    `;

    setTimeout(() => {
    if (mapInstance !== null) {
        mapInstance.remove();
        mapInstance = null;
    }

    if (lat !== undefined && lng !== undefined) {
        mapInstance = L.map('map').setView([lat, lng], 5);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(mapInstance);

        L.marker([lat, lng]).addTo(mapInstance);

        mapInstance.invalidateSize();
    } else {
        console.error("Coordenadas não encontradas para este país");
        document.getElementById('map').innerHTML = "Mapa não disponível para esta região.";
    }
}, 100);
}

buscarPaises();
