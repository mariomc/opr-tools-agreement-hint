// ==UserScript==
// @name         OPR Agreement Hint
// @version      0.1
// @namespace    https://github.com/mariomc/opr-tools-agreement-hint
// @description  Tentative OPR reject detection
// @match        *://opr.ingress.com/recon
// ==/UserScript==

(async () => {
    const MAX_TRIES = 5;
    const WAIT_BETWEEN_TRIES = 1000;

    const log = (message, ...args) => console.log(`[OPR AH] ${message}`, ...args);
    const sleep = async (time) => new Promise(resolve => setTimeout(resolve, time));
    const loadImage = async (imageUrl) => {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = () => { 
                log("image loaded");
                resolve();
            };
            img.onerror = () => {
                log("image errored");
                reject();
            };
            img.src = `${imageUrl}=s0`;
        })
    }
    const doesImageLoad = async (imageUrl) => new Promise(async (resolve) => {
        try {
            await loadImage(imageUrl);
            return resolve(true);
        } catch (ex) {
            return resolve(false)
        }
    })

    const getPhotoUrl = (tries = 0) => {
        log("getPhotoUrl called", tries);

        return new Promise(async (resolve) => {
            if ( tries >= MAX_TRIES ) return resolve();
            const image = document.querySelector('.center-cropped-img');
            const imageSrc = image && image.getAttribute('src');
            if (imageSrc) {
                return resolve(imageSrc);
            } else {
                await sleep(WAIT_BETWEEN_TRIES);
                return resolve(getPhotoUrl(tries + 1));
            }
        });
    }

    const renderData = async () => {
        const photoUrl = await getPhotoUrl();
        if (!photoUrl) {
            log("No photo URL found...");
            return;
        }
        const imageSuceeded = await doesImageLoad(photoUrl);
        const container = document.createElement('div');
        const descriptionDiv = document.querySelector('#descriptionDiv');
        container.innerHTML = `<div><small class="gold">[Agreement hint]</small><br>${imageSuceeded ? 'NO HINT' : 'PROBABLE REJECT'}<br></div>`;
        if ( descriptionDiv ) {
            descriptionDiv.appendChild(container);
        }

    }
    await renderData();
})();