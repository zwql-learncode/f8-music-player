import { collectionOldPopSongs as songs } from "./data.js";

//user config(local storage)
const USER_STORAGE_KEY = "MUSIC_PLAYER";
//header
const player = document.querySelector(".player");
const cd = document.querySelector(".cd");
const header = document.querySelector("header h2");
const cdThumb = document.querySelector(".cd-thumb");
const progress = document.querySelector("#progress");
//btn
const playBtn = document.querySelector(".btn-toggle-play");
const prevBtn = document.querySelector(".btn-prev");
const nextBtn = document.querySelector(".btn-next");
const randomBtn = document.querySelector(".btn-random");
const repeatBtn = document.querySelector(".btn-repeat");
//audio
const audio = document.querySelector("#audio");
//playlist
const playlist = document.querySelector(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  userConfig: JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {},
  songs: songs,
  setUserConfig: function (key, value) {
    this.userConfig[key] = value;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.userConfig));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return ` 
    <div class="song ${
      index === this.currentIndex ? "active" : ""
    }" data-index="${index}">
      <div
        class="thumb"
        style="background-image: url('${song.image}')"
      ></div>
      <div class="body">
        <h3 class="title">${song.name}</h3>
        <p class="author">${song.singer}</p>
      </div>
      <div class="option">
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;

    const cdWidth = cd.offsetWidth;

    // Handle roulette CD
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Handle Zoom & Shrink CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Handle Play/Pause Toogle Click
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Handle Next & Prev Song Click
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Handle Random Song On/Off Toogle Click
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setUserConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Handle Repeat Song On/Off Toogle Click
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setUserConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Handle song's progress
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime * 100) / audio.duration
        );
        progress.value = progressPercent;
      }
    };

    // Handle seek song
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    //Handle when song has ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    //Handle playlist click
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode && !e.target.closest(".option")) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        _this.render();
        audio.play();
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      const activeSong = document.querySelector(".song.active");
      activeSong.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 500);
  },
  loadCurrentSong: function () {
    header.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadUserConfig: function () {
    this.isRandom = this.userConfig.isRandom;
    this.isRepeat = this.userConfig.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    do {
      var newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex == this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    //Loading user config
    this.loadUserConfig();
    //Define object's properties
    this.defineProperties();
    //Listen & Handle DOM events
    this.handleEvents();
    //Loading first song UI when start apps
    this.loadCurrentSong();
    //Render playlist
    this.render();
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
