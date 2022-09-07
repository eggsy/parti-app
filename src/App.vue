<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";

import firstPartSfx from "@/assets/part1.mp3";
import secondPartSfx from "@/assets/part2.mp3";
import thirdPartSfx from "@/assets/rest.mp3";

const input = ref("");
const isSupported = ref(false);
const showVideo = ref(false);
const buttonVisible = ref(false);
const synthesisLanguage = reactive<{
  lang: string;
  data: SpeechSynthesisVoice | null;
}>({
  lang: "",
  data: null,
});

const synth = window.speechSynthesis;

const audio1 = new Audio(firstPartSfx);
const audio2 = new Audio(secondPartSfx);
const audio3 = new Audio(thirdPartSfx);

onMounted(() => {
  stopAll();

  if ("speechSynthesis" in window) {
    updateSelectedLanguage();
    synth.onvoiceschanged = updateSelectedLanguage;

    isSupported.value = true;
  } else
    alert(
      "üzgünüm ama tarayıcın yazıyı sese dönüştürme özelliğini desteklemiyor :c"
    );

  input.value = new URLSearchParams(location.search).get("isim") || "";
});

const speakAndWaitForFinish = () =>
  new Promise((resolve) => {
    const utterThis = new SpeechSynthesisUtterance(input.value);

    utterThis.lang = synthesisLanguage.lang;
    if (synthesisLanguage.data) utterThis.voice = synthesisLanguage.data;

    utterThis.onend = () => {
      resolve(true);
    };

    synth.speak(utterThis);
  });

const stopAll = () => {
  audio1.pause();
  audio2.pause();
  audio3.pause();
  audio1.currentTime = 0;
  audio2.currentTime = 0;
  audio3.currentTime = 0;

  showVideo.value = false;
  buttonVisible.value = false;
};

const updateSelectedLanguage = () => {
  const langs = synth.getVoices();
  const [turkish, fallback] = [
    langs.find((lang) => lang.lang === "tr-TR"),
    langs.find((lang) => lang.lang === "en-US"),
  ];

  if (typeof turkish === "object") {
    synthesisLanguage.lang = "tr-TR";
    synthesisLanguage.data = turkish;
  } else if (fallback) {
    synthesisLanguage.lang = "en-US";
    synthesisLanguage.data = fallback;
  }
};

const speak = () => {
  speakAndWaitForFinish();
  return;

  if (isSupported.value === false) return;
  else if (input.value === "") {
    alert("isim gir.");
    return;
  }

  stopAll();

  audio1.play();

  setTimeout(() => {
    showVideo.value = true;
  }, 500);

  audio1.onended = async () => {
    await speakAndWaitForFinish();
    audio2.play();
  };

  audio2.onended = async () => {
    await speakAndWaitForFinish();
    audio3.play();

    setTimeout(() => {
      buttonVisible.value = true;
    }, 3000);
  };

  audio3.onended = () => {
    showVideo.value = false;
    buttonVisible.value = false;
  };
};
</script>

<template>
  <video
    v-motion-fade
    v-if="showVideo"
    src="/birthday-video.mp4"
    autoplay
    :controls="false"
    playsinline
    muted
    loop
    class="fixed inset-0 pointer-events-none h-screen w-screen object-cover"
  />

  <button
    v-motion-fade
    v-if="buttonVisible"
    type="button"
    class="fixed top-4 text-white/50 z-20 hover:text-white transition-colors hover:bg-black/40 right-4 space-x-2 text-sm flex items-center px-3 py-1.5 rounded-lg bg-black/25"
    @click="stopAll"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-4 h-4"
    >
      <path
        fill-rule="evenodd"
        d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
        clip-rule="evenodd"
      />
    </svg>

    <span>Dur</span>
  </button>

  <main
    class="transition-all z-20 min-h-screen text-white flex items-center justify-center"
    :class="{
      'bg-black': !showVideo,
      'bg-transparent': showVideo,
    }"
  >
    <Transition name="fade" mode="out-in">
      <div
        v-if="!showVideo"
        class="w-1/4 justify-center flex items-stretch gap-2"
      >
        <input
          v-model="input"
          type="text"
          class="px-4 py-2 outline-none focus:ring-1 ring-blue-600 rounded-lg"
          placeholder="İsim girin"
          :class="{
            'text-black': isSupported === true,
            'bg-white/10 text-white/10 placeholder-white/10':
              isSupported === false,
          }"
          :disabled="isSupported === false"
        />

        <button
          class="rounded-lg px-4 text-sm py-2"
          :class="{
            'bg-blue-600 hover:bg-blue-700': isSupported === true,
            'bg-white/10 text-white/20': isSupported === false,
          }"
          :disabled="isSupported === false"
          @click="speak"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M23 7a8.44 8.44 0 0 0-5 1.31c-.36-.41-.73-.82-1.12-1.21l-.29-.27l.14-.12a3.15 3.15 0 0 0 .9-3.49A3.9 3.9 0 0 0 14 1v2a2 2 0 0 1 1.76 1c.17.4 0 .84-.47 1.31l-.23.21a16.71 16.71 0 0 0-3.41-2.2c-2.53-1.14-3.83-.61-4.47 0a2.18 2.18 0 0 0-.46.68l-.18.53L5.1 8.87C6.24 11.71 9 16.76 15 18.94l5-1.66a1 1 0 0 0 .43-.31l.21-.18c1.43-1.44.51-4.21-1.41-6.9A6.63 6.63 0 0 1 23 9zm-3.79 8.37h-.06c-.69.37-3.55-.57-6.79-3.81c-.34-.34-.66-.67-.95-1c-.1-.11-.19-.23-.29-.35l-.53-.64l-.28-.39c-.14-.19-.28-.38-.4-.56s-.16-.26-.24-.39s-.22-.34-.31-.51s-.13-.24-.19-.37s-.17-.28-.23-.42s-.09-.23-.14-.34s-.11-.27-.15-.4S8.6 6 8.58 5.9s-.06-.24-.08-.34a2 2 0 0 1 0-.24a1.15 1.15 0 0 1 0-.26l.11-.31c.17-.18.91-.23 2.23.37a13.83 13.83 0 0 1 2.49 1.54A4.17 4.17 0 0 1 12 7v2a6.43 6.43 0 0 0 3-.94l.49.46c.44.43.83.86 1.19 1.27A5.31 5.31 0 0 0 16 13.2l2-.39a3.23 3.23 0 0 1 0-1.14c1.29 1.97 1.53 3.39 1.21 3.7z"
              fill="currentColor"
            />
            <path
              d="M4.4 11l-2.23 6.7A3.28 3.28 0 0 0 5.28 22a3.21 3.21 0 0 0 1-.17l6.52-2.17A18.7 18.7 0 0 1 4.4 11z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <h1
        v-else
        class="text-colored select-none font-bold drop-shadow-sm text-6xl"
      >
        {{ input }}
      </h1>
    </Transition>
  </main>

  <div
    v-motion-fade
    v-if="showVideo"
    class="fixed pointer-events-none inset-0 z-10 overflow-hidden"
  >
    <img
      src="https://cdn.discordapp.com/emojis/599687667839664198.gif?size=240"
      alt="dancing blob"
      class="dancing-blob-animation absolute bottom-0 left-0"
    />

    <img
      src="https://cdn.discordapp.com/emojis/766542546046025738.gif?size=240"
      alt="pepo party"
      class="absolute rotate-180 top-0 left-0"
    />

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-24 h-24 absolute top-1/2 music-beat-animation -right-8 text-red-600 -rotate-45"
    >
      <path
        d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
      />
    </svg>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* animations */
.text-colored {
  animation: color-change 3s infinite;
}

.dancing-blob-animation {
  animation: dancing-blob 60s infinite;
}

.music-beat-animation {
  animation: music-beat 1s infinite;
}

@keyframes music-beat {
  0% {
    transform: scale(1) rotate(-45deg);
  }
  50% {
    transform: scale(1.1) rotate(-20deg);
  }
  100% {
    transform: scale(1) rotate(-45deg);
  }
}

@keyframes dancing-blob {
  0% {
    transform: translateX(-15vw);
  }
  20% {
    transform: translateX(105vw);
  }
  40% {
    transform: translateX(-15vw);
  }
  60% {
    transform: translateX(105vw);
  }
  80% {
    transform: translateX(-15vw);
  }
  100% {
    transform: translateX(105vw);
  }
}

@keyframes color-change {
  0% {
    transform: scale(1.1);
    @apply text-white;
  }
  25% {
    transform: scale(1);
    @apply text-yellow-600;
  }
  50% {
    transform: scale(1.5);
    @apply text-indigo-600;
  }
  75% {
    transform: scale(1);
    @apply text-emerald-600;
  }
  100% {
    transform: scale(1.1);
    @apply text-white;
  }
}
</style>
