let curraudio = new Audio();
let curr = document.getElementById("curr");
let next = document.getElementById("next");
let prev = document.getElementById("prev");
let songs = [];
let currentFolder = '';
let currentIndex = 0;

async function get(folder) {
    let a = await fetch(`/spotify/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href && element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/spotify/${folder}/`)[1]);
        }
    }

    let list = document.querySelector(".songlist ul");
    list.innerHTML = '';
    for (let song of songs) {
        let li = document.createElement('li');
        li.innerHTML += `
            <div style="display:flex; gap:1.2rem;">
                <img src="img/music.svg" alt="" class="invert">
                <div class="details" style="color: white;">
                    <div class="name">${song.split('.')[0].replaceAll('%20',' ')}</div>
                    <div id="artist">Melodious geek</div>
                </div>
            </div>
            <img src="img/play.svg" alt="" class="invert playsong">
        `;
        list.append(li);

        // Add event listener for each song
        li.querySelector(".playsong").addEventListener('click', () => {
            let name = song.split('.')[0].replaceAll('%20', ' ');
            curraudio.src = folder + '/' + song;
            curraudio.play();
            curr.src = 'img/pause.svg';
            document.querySelector(".songinfo").innerHTML = name;
            currentIndex = songs.indexOf(song); // Update current index
        });
    }

    curraudio.src = folder + '/' + songs[0];
    curraudio.play();
    curr.src='img/pause.svg'
    document.querySelector(".songinfo").innerHTML = songs[0].split('.')[0].replaceAll('%20', ' ');
    currentFolder = folder; // Store the current folder for navigation
    currentIndex = 0; // Reset current index

    return;
}

async function main() {
    await display();

    curraudio.addEventListener('timeupdate', () => {
        document.querySelector(".timeval").innerHTML = `${formatTime(curraudio.currentTime)} / ${formatTime(curraudio.duration)}`;
        document.querySelector('.circle').style.left = ((curraudio.currentTime / curraudio.duration) * 100) + '%';
    });

    let seek = document.querySelector('.seekbar');
    seek.addEventListener('click', e => {
        let t = (e.offsetX / seek.getBoundingClientRect().width) * curraudio.duration;
        document.querySelector('.circle').style.left = (seek.getBoundingClientRect().width - e.x);
        curraudio.currentTime = t;
    });

    document.querySelector(".ham").addEventListener('click', () => {
        document.querySelector(".sidebar").style.left = 0;
    });

    document.querySelector(".spotify svg").addEventListener('click', () => {
        document.querySelector(".sidebar").style.left = -100000 + 'px';
    });

    document.querySelector('.range').addEventListener('change', (e) => {
        curraudio.volume = parseInt(e.target.value) / 100;
    });

    curr.addEventListener('click', () => {
        if (curraudio.paused) {
            curraudio.play();
            curr.src = 'img/pause.svg';
        } else {
            curraudio.pause();
            curr.src = 'img/play.svg';
        }
    });

    next.addEventListener('click', () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        playCurrentSong();
    });

    prev.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = songs.length - 1;
        }
        playCurrentSong();
    });
}

function playCurrentSong() {
    curraudio.src = currentFolder + '/' + songs[currentIndex];
    curraudio.play();
    curr.src = 'img/pause.svg';
    document.querySelector(".songinfo").innerHTML = songs[currentIndex].split('.')[0].replaceAll('%20', ' ');
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = Math.floor(seconds % 60);
    return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
}

async function display() {
    let a = await fetch(`/spotify/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardcont = document.querySelector('.cardcont');
    let as = Array.from(div.getElementsByTagName("a"));
    let albums = [];

    as.forEach(e => {
        if (e.href.includes('songs/')) albums.push(e.href.split('songs/')[1]);
    });

    for (let album of albums) {
        let a = await fetch(`/spotify/songs/${album}/info.json`);
        let response = await a.json();
        cardcont.innerHTML += `
            <div data-folder="${album}" class="card">
                <img src=${response.cover} alt="">
                <div class="svg">
                    <svg class="playbtn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
                        <circle class="bg-circle" cx="12" cy="12" r="12" />
                        <circle class="stroke-circle" cx="12" cy="12" r="12" />
                        <path class="play-path" d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" />
                    </svg>
                </div>
                <h3>${response.name}</h3>
                <p style="color: rgba(255, 255, 255, 0.574);">${response.description}</p>
            </div>`;
    }

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async (event) => {
            let folder = event.currentTarget.dataset.folder;
            await get('songs/' + folder);
        });
    });
}

main();
