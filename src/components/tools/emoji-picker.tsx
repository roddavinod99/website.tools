"use client";

import { useState, useMemo, useCallback } from "react";
import { getStorageJSON, setStorageJSON } from "@/lib/client-storage";

const EMOJI_KEYWORDS: Record<string, string> = {
  "\u{1F600}": "grinning face happy smile",
  "\u{1F603}": "smiley face happy smile",
  "\u{1F604}": "smile happy joy",
  "\u{1F601}": "beaming face grin happy",
  "\u{1F606}": "laughing content joy",
  "\u{1F605}": "sweat smile",
  "\u{1F602}": "joy tears laugh",
  "\u{1F923}": "rofl laugh",
  "\u{1F60A}": "star eyes love",
  "\u{1F607}": "halo angel innocent",
  "\u{1F642}": "slightly smiling",
  "\u{1F643}": "upside down face",
  "\u{1F609}": "wink",
  "\u{1F608}": "smiling horns devil",
  "\u{1F60E}": "sunglasses cool",
  "\u{1F917}": "hug face",
  "\u{1F914}": "thinking face",
  "\u{1F610}": "neutral face",
  "\u{1F611}": "expressionless face",
  "\u{1F636}": "no mouth silence",
  "\u{1F60F}": "smirk",
  "\u{1F62C}": "grimacing face",
  "\u{1F912}": "nerd face glasses",
  "\u{1F92D}": "face hand mouth",
  "\u{1F61B}": "tongue sticking out",
  "\u{1F61C}": "winking tongue",
  "\u{1F92A}": "zany face wild",
  "\u{1F61D}": "licking face",
  "\u{1F910}": "zipper mouth shush",
  "\u{1F928}": "face raised eyebrow",
  "\u{1F612}": "unamused face annoyed",
  "\u{1F644}": "rolling eyes",
  "\u{1F62E}": "surprised face wow",
  "\u{1F62F}": "hushed face",
  "\u{1F632}": "astonished face shocked",
  "\u{1F633}": "flushed face embarrassed",
  "\u{1F970}": "smiling hearts love",
  "\u{1F60B}": "yummy face savoring",
  "\u{1F61E}": "disappointed sad",
  "\u{1F614}": "pensive sad",
  "\u{1F61A}": "confused face uncertain",
  "\u{1F620}": "angry face mad",
  "\u{1F621}": "pouting face rage",
  "\u{1F624}": "triumph face",
  "\u{1F625}": "disappointed relieved",
  "\u{1F622}": "crying face sad",
  "\u{1F62D}": "loudly crying face sob",
  "\u{1F631}": "scream face fear",
  "\u{1F630}": "cold sweat anxious",
  "\u{1F628}": "fearful face",
  "\u{1F623}": "weary face tired",
  "\u{1F629}": "weary sigh",
  "\u{1F62A}": "sleepy tired",
  "\u{1F62B}": "tired face exhausted",
  "\u{1F634}": "sleeping face zzz",
  "\u{1F63A}": "smiling cat",
  "\u{1F975}": "hot face sweating",
  "\u{1F976}": "cold face freezing",
  "\u{1F97A}": "pleading face begging",
  "\u{1F973}": "partying face celebration",
  "\u{1F60C}": "relieved calm",
  "\u{1F913}": "nerd glasses smart",
  "\u{1F618}": "face blowing kiss",
  "\u{1F619}": "kissing face love",
  "\u{1F61F}": "worried face concerned",
  "\u{1F91D}": "handshake deal greeting",
  "\u{1F616}": "kissing closed eyes",
  "\u{1F626}": "frowning face sad",
  "\u{1F627}": "anguished face",
  "\u{1F44D}": "thumbs up like good yes approve",
  "\u{1F44E}": "thumbs down dislike no",
  "\u{1F44B}": "waving hand hello hi bye wave",
  "\u{1F44F}": "clapping hands applause bravo",
  "\u{1F64C}": "raising hands celebration yay",
  "\u{1F450}": "open hands hug",
  "\u{1F64F}": "folded hands pray please thank you namaste",
  "\u{1F44C}": "ok hand perfect",
  "\u{1F90C}": "pinched fingers heart",
  "\u{1F90F}": "pinching hand small tiny",
  "\u{270A}": "fist raised power solidarity",
  "\u{1F44A}": "fist bump punch",
  "\u{1F91C}": "fist forward right",
  "\u{1F91B}": "fist left",
  "\u{1F448}": "pointing left",
  "\u{1F449}": "pointing right",
  "\u{1F446}": "pointing up",
  "\u{1F447}": "pointing down",
  "\u{1F440}": "eyes look see watch",
  "\u{1F443}": "nose smell",
  "\u{1F445}": "tongue out playful",
  "\u{1F444}": "lips mouth speaking",
  "\u{1F911}": "money face yum tasty",

  "\u{1F48B}": "kiss lips love",
  "\u{1F48C}": "love letter mail envelope",
  "\u{1F590}": "hand raised greeting high five",
  "\u{1FA71}": "pink heart love cute",
  "\u{1FA72}": "light blue heart",
  "\u{1FA70}": "ballet shoes dance",
  "\u{1F9B4}": "bone skeleton",
  "\u{1F9B5}": "leg kick walk",
  "\u{1F9B6}": "foot kick",
  "\u{1F9B7}": "tooth dental",
  "\u{1F9B8}": "superhero strength power",
  "\u{1F9B9}": "supervillain evil",
  "\u{1F9BA}": "safety vest emergency",
  "\u{1F9BB}": "ear hearing listen",
  "\u{1F91E}": "crossed fingers luck hope",
  "\u{1F91F}": "heart hands love you",
  "\u{1FAF0}": "hand heart love",
  "\u{1FAF1}": "palm down hand",
  "\u{1FAF2}": "handshake deal",
  "\u{1FAF3}": "handshake medium",
  "\u{1FAF4}": "handshake light",
  "\u{1FAF5}": "handshake dark",
  "\u{1F436}": "dog puppy pet animal",
  "\u{1F431}": "cat kitten pet animal",
  "\u{1F42D}": "mouse rodent",
  "\u{1F439}": "hamster pet cute",
  "\u{1F430}": "rabbit bunny pet",
  "\u{1F43B}": "bear animal",
  "\u{1F437}": "pig animal farm",
  "\u{1F428}": "koala bear cute",
  "\u{1F42F}": "tiger animal wild",
  "\u{1F43E}": "paw prints animal",
  "\u{1F42A}": "camel animal desert",
  "\u{1F42B}": "two humped camel",
  "\u{1F40D}": "snake animal",
  "\u{1F422}": "turtle slow animal",
  "\u{1F400}": "rat rodent",
  "\u{1F43F}": "chipmunk squirrel",
  "\u{1F407}": "rabbit bunny animal",
  "\u{1F408}": "cat wild",
  "\u{1F43C}": "panda face cute",
  "\u{1F43D}": "pig nose",
  "\u{1F42E}": "cow farm animal",
  "\u{1F417}": "boar pig animal",
  "\u{1F434}": "horse animal riding",
  "\u{1F984}": "unicorn magical",
  "\u{1F41D}": "bee honey insect",
  "\u{1F41B}": "bug insect",
  "\u{1F40C}": "snail slow",
  "\u{1F98B}": "butterfly insect beautiful",
  "\u{1F41A}": "shell spiral ocean",
  "\u{1F419}": "octopus squid ocean",
  "\u{1F420}": "tropical fish",
  "\u{1F41F}": "fish animal ocean",
  "\u{1F42C}": "dolphin ocean marine",
  "\u{1F433}": "whale ocean marine",
  "\u{1F40A}": "crocodile alligator",
  "\u{1F406}": "leopard animal wild",
  "\u{1F405}": "tiger animal wild",
  "\u{1F418}": "elephant animal",
  "\u{1F412}": "monkey primate",
  "\u{1F414}": "chicken rooster bird",
  "\u{1F427}": "penguin bird cute",
  "\u{1F425}": "baby chick bird",
  "\u{1F423}": "hatching chick bird",
  "\u{1F54A}": "dove peace bird",
  "\u{1F413}": "rooster chicken bird",
  "\u{1F424}": "chick bird baby",
  "\u{1F40B}": "whale ocean big",
  "\u{1F41E}": "ladybug insect",
  "\u{1F34E}": "apple fruit red",
  "\u{1F34A}": "orange fruit citrus",
  "\u{1F34B}": "lemon fruit citrus sour",
  "\u{1F34C}": "banana fruit",
  "\u{1F349}": "watermelon fruit summer",
  "\u{1F347}": "grapes fruit purple",
  "\u{1F353}": "strawberry fruit",
  "\u{1FAD0}": "blueberry fruit",
  "\u{1F95D}": "kiwi fruit green",
  "\u{1F336}": "chili pepper spicy hot",
  "\u{1F33D}": "corn vegetable",
  "\u{1F344}": "mushroom food",
  "\u{1F9C5}": "potato vegetable",
  "\u{1F9C6}": "broccoli vegetable green",
  "\u{1F954}": "carrot vegetable orange",
  "\u{1F955}": "ginger root vegetable",
  "\u{1F33F}": "herb plant leaf",
  "\u{1F96A}": "sandwich food lunch",
  "\u{1F32E}": "taco mexican food",
  "\u{1F32F}": "burrito mexican food",
  "\u{1F354}": "hamburger burger fast food",
  "\u{1F355}": "pizza food",
  "\u{1F35D}": "spaghetti pasta noodles",
  "\u{1F35C}": "ramen noodles bowl",
  "\u{1F35B}": "curry rice indian",
  "\u{1F35A}": "rice bowl food",
  "\u{1F359}": "rice ball japanese onigiri",
  "\u{1F358}": "rice cracker japanese",
  "\u{1F357}": "poultry leg chicken drumstick",
  "\u{1F356}": "meat on bone steak",
  "\u{1F35F}": "french fries chips",
  "\u{1F363}": "sushi japanese food",
  "\u{1F370}": "shortcake dessert cake sweet",
  "\u{1F36B}": "chocolate bar candy sweet",
  "\u{1F36C}": "candy sweet lollipop",
  "\u{1F366}": "soft ice cream dessert",
  "\u{1F37B}": "clinking glasses cheers drink",
  "\u{1F378}": "cocktail drink alcohol wine",
  "\u{1F37A}": "beer drink alcohol",
  "\u{1F375}": "tea cup hot beverage",
  "\u{1F9C3}": "beverage milk drink",
  "\u{2615}": "coffee cup hot drink",
  "\u{1F964}": "glass milk drink",
  "\u{1F9C2}": "ice water cold",
  "\u{1F371}": "bento box lunch",
  "\u{1F372}": "pot of food stew",
  "\u{1F958}": "shallow pan food cooking",
  "\u{1F959}": "fork and knife plate",
  "\u{1F95E}": "pancakes breakfast",
  "\u{1F9C7}": "waffle breakfast",
  "\u{1F3E0}": "house home building",
  "\u{1F3E2}": "office building work",
  "\u{1F3E5}": "hospital medical",
  "\u{1F3EB}": "school education university",
  "\u{1F3EC}": "department store shopping",
  "\u{1F3EF}": "castle japan",
  "\u{1F3F0}": "castle european",
  "\u{1F302}": "umbrella rain weather",
  "\u{2602}": "umbrella weather rain",
  "\u{26F2}": "fountain park water",
  "\u{1F305}": "sunrise morning dawn",
  "\u{1F304}": "mountain sunrise mount fuji",
  "\u{1F307}": "sunset evening",
  "\u{1F309}": "bridge night",
  "\u{1F306}": "cityscape night urban",
  "\u{1F308}": "rainbow colorful",
  "\u{1F30A}": "ocean wave water sea",
  "\u{26F5}": "sailboat sailing",
  "\u{1F6F4}": "scooter motor",
  "\u{1F6F5}": "moped scooter",
  "\u{1F6F6}": "kayak canoe water",
  "\u{1F682}": "locomotive train",
  "\u{1F683}": "railway car train",
  "\u{1F684}": "high speed train bullet",
  "\u{1F685}": "bullet train shinkansen",
  "\u{1F686}": "metro subway underground",
  "\u{1F687}": "light rail train tram",
  "\u{1F689}": "station train",
  "\u{1F68A}": "tram trolley",
  "\u{1F68C}": "bus public transport",
  "\u{1F691}": "ambulance emergency medical",
  "\u{1F692}": "fire engine truck emergency",
  "\u{1F695}": "taxi car vehicle",
  "\u{1F697}": "car automobile",
  "\u{1F699}": "sport utility vehicle suv",
  "\u{1F6F2}": "railway train tram",
  "\u{1F680}": "rocket space launch",
  "\u{1F6F0}": "satellite space orbit",
  "\u{1F3AF}": "bullseye target goal",
  "\u{1F3C6}": "trophy award winner champion",
  "\u{1F3C5}": "medal sports",
  "\u{1F3C3}": "running athlete marathon jog",
  "\u{1F3C4}": "swimmer swimming pool",
  "\u{1F3CA}": "swimmer athlete",
  "\u{1F3C8}": "soccer football sports ball",
  "\u{26BD}": "soccer ball football sports",
  "\u{1F3C9}": "basketball sports",
  "\u{26BE}": "baseball sports",
  "\u{1F3CF}": "cricket bat sport",
  "\u{1F3D0}": "volleyball sport",
  "\u{1F3D1}": "football rugby",
  "\u{1F3D2}": "ice hockey puck sport",
  "\u{1F3D3}": "ping pong table tennis",
  "\u{1F3D4}": "skier snow winter",
  "\u{1F3D5}": "tent camping outdoors",
  "\u{1F3D6}": "surfing sport water",
  "\u{1F3D7}": "construction worker building",
  "\u{26F7}": "skier skiing winter snow",
  "\u{26F8}": "ice skating winter",
  "\u{26F9}": "person bouncing ball sport",
  "\u{1F938}": "juggler talent",
  "\u{1F93C}": "wrestlers sport fighting",
  "\u{1F93D}": "water polo sport",
  "\u{1F93E}": "volleyball player sport",
  "\u{1F3A8}": "palette art paint creative",
  "\u{1F3AC}": "clapper board movie film",
  "\u{1F3AD}": "performing arts theater",
  "\u{1F3AE}": "video game controller gaming play",
  "\u{1F3B0}": "slot machine casino gambling",
  "\u{1F3B1}": "pool billiards snooker",
  "\u{1F3B2}": "game die dice",
  "\u{1F3B3}": "bowling sport",
  "\u{1F3B5}": "musical note music",
  "\u{1F3B6}": "musical notes music",
  "\u{1F3B7}": "saxophone music instrument",
  "\u{1F3B8}": "guitar music instrument",
  "\u{1F3B9}": "keyboard piano music",
  "\u{1F3BA}": "trumpet music instrument",
  "\u{1F3BB}": "violin music instrument",
  "\u{1F3BC}": "musical score music",
  "\u{1F3BD}": "running shirt sport",
  "\u{1F3BE}": "tennis racket sport",
  "\u{1F3BF}": "skiing sport winter",
  "\u{1F3C0}": "basketball sport ball",
  "\u{1F4A1}": "light bulb idea",
  "\u{1F526}": "flashlight torch",
  "\u{1F4EE}": "postbox mail",
  "\u{1F4E6}": "package box delivery",
  "\u{1F4E4}": "outbox tray mail",
  "\u{1F4F0}": "newspaper news",
  "\u{1F4F1}": "mobile phone smartphone",
  "\u{1F4F2}": "mobile call phone",
  "\u{1F4BB}": "laptop computer work coding",
  "\u{1F4BD}": "disk floppy memory",
  "\u{1F4BE}": "floppy disk save",
  "\u{1F4BF}": "dvd optical disc",
  "\u{1F4C0}": "dvd disc",
  "\u{1F4DA}": "books library education",
  "\u{1F4D6}": "open book reading",
  "\u{1F4D5}": "closed book",
  "\u{1F4D7}": "green book",
  "\u{1F4D8}": "blue book",
  "\u{1F4D9}": "orange book",
  "\u{1F4DC}": "scroll ancient document",
  "\u{1F4DD}": "memo write pencil",
  "\u{1F4DE}": "telephone phone call",
  "\u{1F4DF}": "pager communication",
  "\u{1F4E0}": "fax machine",
  "\u{1F4E1}": "satellite antenna",
  "\u{1F4E2}": "loudspeaker announcement",
  "\u{1F4E3}": "megaphone speaker",
  "\u{1F50B}": "battery power energy",
  "\u{1F50C}": "electric plug power",
  "\u{1F4E8}": "incoming envelope mail",
  "\u{1F4E9}": "envelope mail letter",
  "\u{1F4EA}": "mailbox closed mail",
  "\u{1F4EB}": "mailbox mail post",
  "\u{1F4EC}": "mailbox with mail",
  "\u{1F4ED}": "mailbox with post",
  "\u{1F511}": "key lock password",
  "\u{1F512}": "locked lock security",
  "\u{1F513}": "unlocked open lock",
  "\u{1F514}": "bell notification alert",
  "\u{1F516}": "bookmark save",
  "\u{1F517}": "link chain",
  "\u{1F518}": "radio button",
  "\u{1F519}": "back arrow return",
  "\u{1F51A}": "end mark",
  "\u{1F51B}": "on active",
  "\u{1F51C}": "soon mark",
  "\u{1F51D}": "top arrow up",
  "\u{1F52E}": "crystal ball fortune magic",
  "\u{1F52C}": "microscope science lab",
  "\u{1F525}": "fire flame hot",
  "\u{2764}": "red heart love",
  "\u{1F494}": "broken heart sad",
  "\u{1F495}": "two hearts love",
  "\u{1F496}": "sparkling heart love",
  "\u{1F497}": "growing heart love",
  "\u{1F498}": "heart with arrow cupid love",
  "\u{1F499}": "blue heart",
  "\u{1F49A}": "green heart",
  "\u{1F49B}": "yellow heart",
  "\u{1F49C}": "purple heart",
  "\u{2763}": "heart exclamation love",
  "\u{1F493}": "beating heart love",
  "\u{2665}": "heart suit love",
  "\u{2709}": "envelope mail letter",
  "\u{2611}": "ballot check box",
  "\u{2614}": "umbrella rain weather",
  "\u{2600}": "sun weather sunny",
  "\u{2B50}": "star yellow favorite",
  "\u{2601}": "cloud weather overcast",
  "\u{26A1}": "lightning thunderstorm electric",
  "\u{2744}": "snowflake winter cold",
  "\u{231A}": "watch time",
  "\u{231B}": "hourglass time",
  "\u{23F0}": "alarm clock time morning",
  "\u{23F1}": "stopwatch timer",
  "\u{23F2}": "timer clock",
  "\u{23F3}": "hourglass running time",
  "\u{267F}": "wheelchair accessibility disabled",
  "\u{2328}": "keyboard computer typing",
  "\u{2699}": "gear settings configuration",
  "\u{269B}": "atom science physics",
  "\u{269C}": "fleur de lis",
  "\u{2604}": "comet space meteor",
  "\u{2622}": "radioactive nuclear danger",
  "\u{2623}": "biohazard danger toxic",
  "\u{2620}": "skull danger poison death",
  "\u{2694}": "crossed swords battle war",
  "\u{2695}": "medical staff hospital",
  "\u{262E}": "peace symbol hippie",
  "\u{262F}": "yin yang balance",
  "\u{2638}": "wheel dharma buddhism",
  "\u{2639}": "frowning face sad",
  "\u{263A}": "smiling face happy",
  "\u{2640}": "female sign woman",
  "\u{2642}": "male sign man",
  "\u{2696}": "balance scale justice law",
  "\u{2697}": "alembic science chemistry",
  "\u{1F1E6}\u{1F1EB}": "flag afghanistan af",
  "\u{1F1E6}\u{1F1F1}": "flag albania al",
  "\u{1F1E9}\u{1F1FF}": "flag algeria dz",
  "\u{1F1E7}\u{1F1E9}": "flag bangladesh bd",
  "\u{1F1E7}\u{1F1E7}": "flag barbados bb",
  "\u{1F1E7}\u{1F1EA}": "flag belgium be",
  "\u{1F1E7}\u{1F1F9}": "flag bhutan bt",
  "\u{1F1E7}\u{1F1F4}": "flag bolivia bo",
  "\u{1F1E7}\u{1F1FC}": "flag botswana bw",
  "\u{1F1E7}\u{1F1FF}": "flag belize bz",
  "\u{1F1E8}\u{1F1E6}": "flag canada ca",
  "\u{1F1E8}\u{1F1F2}": "flag cameroon cm",
  "\u{1F1E8}\u{1F1E9}": "flag dr congo cd",
  "\u{1F1F9}\u{1F1E9}": "flag chad td",
  "\u{1F1E8}\u{1F1F1}": "flag chile cl",
  "\u{1F1E8}\u{1F1F3}": "flag china cn",
  "\u{1F1E8}\u{1F1F4}": "flag colombia co",
  "\u{1F1E8}\u{1F1FA}": "flag cuba cu",
  "\u{1F1E8}\u{1F1FC}": "flag curacao cw",
  "\u{1F1E8}\u{1F1FE}": "flag cyprus cy",
  "\u{1F1E8}\u{1F1FF}": "flag czech republic cz",
  "\u{1F1E9}\u{1F1F0}": "flag denmark dk",
  "\u{1F1E9}\u{1F1EF}": "flag djibouti dj",
  "\u{1F1E9}\u{1F1F2}": "flag dominican dm",
  "\u{1F1E9}\u{1F1F4}": "flag dominican do",
  "\u{1F1EA}\u{1F1E8}": "flag ecuador ec",
  "\u{1F1EA}\u{1F1EC}": "flag egypt eg",
  "\u{1F1EB}\u{1F1F7}": "flag france fr",
  "\u{1F1EC}\u{1F1E7}": "flag united kingdom gb uk",
  "\u{1F1EC}\u{1F1E9}": "flag grenada gd",
  "\u{1F1EC}\u{1F1EA}": "flag georgia ge",
  "\u{1F1E9}\u{1F1EA}": "flag germany de",
  "\u{1F1EC}\u{1F1F7}": "flag greece gr",
  "\u{1F1FD}\u{1F1F0}": "flag kosovo xk",
  "\u{1F1F2}\u{1F1FE}": "flag malaysia my",
  "\u{1F1FC}\u{1F1F8}": "flag samoa ws",
  "\u{1F1FF}\u{1F1E6}": "flag south africa za",
  "\u{1F1EC}\u{1F1F8}": "flag spain es",
  "\u{1F1FA}\u{1F1F8}": "flag united states us america",
  "\u{1F1FB}\u{1F1EE}": "flag us virgin islands vi",
  "\u{1F1FB}\u{1F1EC}": "flag british virgin islands vg",
  "\u{1F1FB}\u{1F1F3}": "flag vietnam vn",
  "\u{1F1FB}\u{1F1FA}": "flag vanuatu vu",
  "\u{1F1FB}\u{1F1EA}": "flag venezuela ve",
  "\u{1F1FC}\u{1F1EB}": "flag wallis wf",
  "\u{1F1FE}\u{1F1EA}": "flag yemen ye",
  "\u{1F1FF}\u{1F1F2}": "flag zambia zm",
  "\u{1F1FF}\u{1F1FC}": "flag zimbabwe zw",
};

const CATEGORIES: Record<string, string[]> = {
  Smileys: [
    "\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}",
    "\u{1F605}", "\u{1F602}", "\u{1F923}", "\u{1F60A}", "\u{1F607}",
    "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F608}", "\u{1F60E}",
    "\u{1F917}", "\u{1F914}", "\u{1F610}", "\u{1F611}", "\u{1F636}",
    "\u{1F60F}", "\u{1F62C}", "\u{1F912}", "\u{1F92D}", "\u{1F911}",
    "\u{1F61B}", "\u{1F61C}", "\u{1F92A}", "\u{1F61D}", "\u{1F910}",
    "\u{1F928}", "\u{1F612}", "\u{1F644}", "\u{1F62E}", "\u{1F62F}",
    "\u{1F632}", "\u{1F633}", "\u{1F970}", "\u{1F60B}", "\u{1F61E}",
    "\u{1F614}", "\u{1F61A}", "\u{1F620}", "\u{1F621}", "\u{1F624}",
    "\u{1F625}", "\u{1F622}", "\u{1F62D}", "\u{1F631}", "\u{1F630}",
    "\u{1F628}", "\u{1F623}", "\u{1F629}", "\u{1F62A}", "\u{1F62B}",
    "\u{1F634}", "\u{1F63A}", "\u{1F975}", "\u{1F976}", "\u{1F97A}",
    "\u{1F973}", "\u{1F60C}", "\u{1F913}", "\u{1F618}", "\u{1F619}",
    "\u{1F61F}", "\u{1F91D}", "\u{1F616}", "\u{1F626}", "\u{1F627}",
  ],
  People: [
    "\u{1F44D}", "\u{1F44E}", "\u{1F44B}", "\u{1F44F}", "\u{1F64C}",
    "\u{1F450}", "\u{1F64F}", "\u{1F44C}", "\u{1F90C}", "\u{1F90F}",
    "\u{270A}", "\u{1F44A}", "\u{1F91C}", "\u{1F91B}", "\u{1F448}",
    "\u{1F449}", "\u{1F446}", "\u{1F447}", "\u{1F440}", "\u{1F443}",
    "\u{1F445}", "\u{1F444}", "\u{1F911}", "\u{1F48B}", "\u{1F48C}",
    "\u{1F590}", "\u{1FA71}", "\u{1FA72}", "\u{1FA70}", "\u{1F9B4}",
    "\u{1F9B5}", "\u{1F9B6}", "\u{1F9B7}", "\u{1F9B8}", "\u{1F9B9}",
    "\u{1F9BA}", "\u{1F9BB}", "\u{1F91E}", "\u{1F91F}", "\u{1FAF0}",
    "\u{1FAF1}", "\u{1FAF2}", "\u{1FAF3}", "\u{1FAF4}", "\u{1FAF5}",
  ],
  Animals: [
    "\u{1F436}", "\u{1F431}", "\u{1F42D}", "\u{1F439}", "\u{1F430}",
    "\u{1F43B}", "\u{1F437}", "\u{1F428}", "\u{1F42F}", "\u{1F43E}",
    "\u{1F42A}", "\u{1F42B}", "\u{1F40D}", "\u{1F422}",
    "\u{1F400}", "\u{1F43F}", "\u{1F407}", "\u{1F408}", "\u{1F42F}",
    "\u{1F43C}", "\u{1F43D}", "\u{1F42E}", "\u{1F417}", "\u{1F434}",
    "\u{1F984}", "\u{1F41D}", "\u{1F41B}", "\u{1F40C}", "\u{1F98B}",
    "\u{1F41A}", "\u{1F419}", "\u{1F420}", "\u{1F41F}", "\u{1F42C}",
    "\u{1F433}", "\u{1F40A}", "\u{1F406}", "\u{1F405}", "\u{1F418}",
    "\u{1F412}", "\u{1F414}", "\u{1F427}", "\u{1F425}", "\u{1F423}",
    "\u{1F54A}", "\u{1F413}", "\u{1F424}", "\u{1F40B}", "\u{1F41E}",
  ],
  Food: [
    "\u{1F34E}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F349}",
    "\u{1F347}", "\u{1F353}", "\u{1FAD0}", "\u{1F95D}", "\u{1F336}",
    "\u{1F33D}", "\u{1F344}", "\u{1F9C5}", "\u{1F9C6}", "\u{1F954}",
    "\u{1F955}", "\u{1F33F}", "\u{1F96A}", "\u{1F32E}", "\u{1F32F}",
    "\u{1F354}", "\u{1F355}", "\u{1F35D}", "\u{1F35C}", "\u{1F35B}",
    "\u{1F35A}", "\u{1F359}", "\u{1F358}", "\u{1F357}", "\u{1F356}",
    "\u{1F35F}", "\u{1F363}", "\u{1F370}", "\u{1F36B}", "\u{1F36C}",
    "\u{1F366}", "\u{1F37B}", "\u{1F378}", "\u{1F37A}", "\u{1F375}",
    "\u{1F9C3}", "\u{2615}", "\u{1F964}", "\u{1F9C2}", "\u{1F371}",
    "\u{1F372}", "\u{1F958}", "\u{1F959}", "\u{1F95E}", "\u{1F9C7}",
  ],
  Travel: [
    "\u{1F3E0}", "\u{1F3E2}", "\u{1F3E5}", "\u{1F3EB}", "\u{1F3EC}",
    "\u{1F3EF}", "\u{1F3F0}", "\u{1F302}", "\u{2602}", "\u{26F2}",
    "\u{1F305}", "\u{1F304}", "\u{1F307}", "\u{1F309}", "\u{1F306}",
    "\u{1F308}", "\u{1F30A}", "\u{26F5}", "\u{1F6F4}", "\u{1F6F5}",
    "\u{1F6F6}", "\u{1F682}", "\u{1F683}", "\u{1F684}", "\u{1F685}",
    "\u{1F686}", "\u{1F687}", "\u{1F689}", "\u{1F68A}", "\u{1F68C}",
    "\u{1F691}", "\u{1F692}", "\u{1F695}", "\u{1F697}", "\u{1F699}",
    "\u{1F6F2}", "\u{1F680}", "\u{1F6F0}", "\u{1F3AF}", "\u{1F3C6}",
    "\u{1F3C5}", "\u{1F3C3}", "\u{1F3C4}", "\u{1F3CA}", "\u{1F3C8}",
  ],
  Activities: [
    "\u{1F3A8}", "\u{1F3AC}", "\u{1F3AD}", "\u{1F3AE}", "\u{1F3AF}",
    "\u{1F3B0}", "\u{1F3B1}", "\u{1F3B2}", "\u{1F3B3}", "\u{1F3B5}",
    "\u{1F3B6}", "\u{1F3B7}", "\u{1F3B8}", "\u{1F3B9}", "\u{1F3BA}",
    "\u{1F3BB}", "\u{1F3BC}", "\u{1F3BD}", "\u{1F3BE}", "\u{1F3BF}",
    "\u{1F3C0}", "\u{26BD}", "\u{1F3C9}", "\u{26BE}", "\u{1F3C8}",
    "\u{26BE}", "\u{1F3CF}", "\u{1F3D0}", "\u{1F3D1}", "\u{1F3D2}",
    "\u{1F3D3}", "\u{1F3D4}", "\u{1F3D5}", "\u{1F3D6}", "\u{1F3D7}",
    "\u{26F7}", "\u{26F8}", "\u{26F9}", "\u{1F3C4}", "\u{1F3CA}",
    "\u{1F938}", "\u{1F93C}", "\u{1F93D}", "\u{1F93E}", "\u{1FA70}",
  ],
  Objects: [
    "\u{1F4A1}", "\u{1F526}", "\u{1F4EE}", "\u{1F4E6}", "\u{1F4E4}",
    "\u{1F4F0}", "\u{1F4F1}", "\u{1F4F2}", "\u{1F4BB}", "\u{1F4BD}",
    "\u{1F4BE}", "\u{1F4BF}", "\u{1F4C0}", "\u{1F4DA}", "\u{1F4D6}",
    "\u{1F4D5}", "\u{1F4D7}", "\u{1F4D8}", "\u{1F4D9}", "\u{1F4DC}",
    "\u{1F4DD}", "\u{1F4DE}", "\u{1F4DF}", "\u{1F4E0}", "\u{1F4E1}",
    "\u{1F4E2}", "\u{1F4E3}", "\u{1F50B}", "\u{1F50C}", "\u{1F4E8}",
    "\u{1F4E9}", "\u{1F4EA}", "\u{1F4EB}", "\u{1F4EC}", "\u{1F4ED}",
    "\u{1F511}", "\u{1F512}", "\u{1F513}", "\u{1F514}", "\u{1F516}",
    "\u{1F517}", "\u{1F518}", "\u{1F519}", "\u{1F51A}", "\u{1F51B}",
    "\u{1F51C}", "\u{1F51D}", "\u{1F52E}", "\u{1F52C}", "\u{1F525}",
  ],
  Symbols: [
    "\u{2764}", "\u{1F494}", "\u{1F495}", "\u{1F496}", "\u{1F497}",
    "\u{1F498}", "\u{1F499}", "\u{1F49A}", "\u{1F49B}", "\u{1F49C}",
    "\u{2763}", "\u{1F493}", "\u{2665}", "\u{2709}", "\u{2611}",
    "\u{2614}", "\u{2600}", "\u{2B50}", "\u{2601}", "\u{26A1}",
    "\u{2744}", "\u{2602}", "\u{2615}", "\u{231A}", "\u{231B}",
    "\u{23F0}", "\u{23F1}", "\u{23F2}", "\u{23F3}", "\u{267F}",
    "\u{2328}", "\u{2699}", "\u{269B}", "\u{269C}", "\u{2604}",
    "\u{2622}", "\u{2623}", "\u{2620}", "\u{2694}", "\u{2695}",
    "\u{262E}", "\u{262F}", "\u{2638}", "\u{2639}", "\u{263A}",
    "\u{2640}", "\u{2642}", "\u{2695}", "\u{2696}", "\u{2697}",
  ],
  Flags: [
    "\u{1F1E6}\u{1F1EB}", "\u{1F1E6}\u{1F1F1}", "\u{1F1E9}\u{1F1FF}",
    "\u{1F1E7}\u{1F1E9}", "\u{1F1E7}\u{1F1E7}", "\u{1F1E7}\u{1F1EA}",
    "\u{1F1E7}\u{1F1FF}", "\u{1F1E7}\u{1F1F9}", "\u{1F1E7}\u{1F1F4}",
    "\u{1F1E7}\u{1F1FC}", "\u{1F1E8}\u{1F1E6}", "\u{1F1E8}\u{1F1F2}",
    "\u{1F1E8}\u{1F1E9}", "\u{1F1F9}\u{1F1E9}", "\u{1F1E8}\u{1F1F1}",
    "\u{1F1E8}\u{1F1F3}", "\u{1F1E8}\u{1F1F4}", "\u{1F1E8}\u{1F1FA}",
    "\u{1F1E8}\u{1F1FC}", "\u{1F1E8}\u{1F1FE}", "\u{1F1E8}\u{1F1FF}",
    "\u{1F1E9}\u{1F1F0}", "\u{1F1E9}\u{1F1EF}", "\u{1F1E9}\u{1F1F2}",
    "\u{1F1E9}\u{1F1F4}", "\u{1F1EA}\u{1F1E8}", "\u{1F1EA}\u{1F1EC}",
    "\u{1F1EB}\u{1F1F7}", "\u{1F1EC}\u{1F1E7}", "\u{1F1EC}\u{1F1E9}",
    "\u{1F1EC}\u{1F1EA}", "\u{1F1E9}\u{1F1EA}", "\u{1F1EC}\u{1F1F7}",
    "\u{1F1FD}\u{1F1F0}", "\u{1F1F2}\u{1F1FE}", "\u{1F1FC}\u{1F1F8}",
    "\u{1F1FF}\u{1F1E6}", "\u{1F1EC}\u{1F1F8}",
    "\u{1F1FA}\u{1F1F8}", "\u{1F1FB}\u{1F1EE}", "\u{1F1FB}\u{1F1EC}",
    "\u{1F1FB}\u{1F1F3}", "\u{1F1FB}\u{1F1FA}", "\u{1F1FB}\u{1F1EA}",
    "\u{1F1FC}\u{1F1EB}", "\u{1F1FE}\u{1F1EA}",
    "\u{1F1FF}\u{1F1F2}", "\u{1F1FF}\u{1F1FC}",
  ],
};

const CATEGORY_ICONS: Record<string, string> = {
  Smileys: "\u{1F600}",
  People: "\u{1F44D}",
  Animals: "\u{1F431}",
  Food: "\u{1F34E}",
  Travel: "\u{2708}",
  Activities: "\u{26BD}",
  Objects: "\u{1F4A1}",
  Symbols: "\u{2764}",
  Flags: "\u{1F1FA}\u{1F1F8}",
};

function getRecentEmojis(): string[] {
  return getStorageJSON<string[]>("emoji-recent") || [];
}

export function EmojiPicker() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Smileys");
  const [recent, setRecent] = useState<string[]>(getRecentEmojis);
  const [copiedEmoji, setCopiedEmoji] = useState("");

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return CATEGORIES[activeCategory] || [];
    const q = search.toLowerCase();
    return Object.values(CATEGORIES).flat().filter((emoji) => {
      const keywords = EMOJI_KEYWORDS[emoji];
      return keywords && keywords.toLowerCase().includes(q);
    });
  }, [search, activeCategory]);

  const handleCopy = useCallback(async (emoji: string) => {
    await navigator.clipboard.writeText(emoji);
    setCopiedEmoji(emoji);
    setTimeout(() => setCopiedEmoji(""), 1500);
    setRecent((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 24);
      setStorageJSON("emoji-recent", next);
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Search Emojis</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type to search..."
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {recent.length > 0 && (
          <button
            onClick={() => setActiveCategory("__recent__")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === "__recent__"
                ? "bg-brand-500 text-white"
                : "rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
            }`}
          >
            Recent
          </button>
        )}
        {Object.keys(CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearch(""); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-brand-500 text-white"
                : "rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
            }`}
          >
            <span className="mr-1">{CATEGORY_ICONS[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface max-h-96 overflow-y-auto">
        {search.trim() ? (
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
            {filteredEmojis
              .map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => handleCopy(emoji)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl hover:bg-surface-200 dark:hover:bg-dark-bg transition-colors"
                  title={copiedEmoji === emoji ? "Copied!" : "Click to copy"}
                >
                  {emoji}
                </button>
              ))}
          </div>
        ) : activeCategory === "__recent__" ? (
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
            {recent.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handleCopy(emoji)}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl hover:bg-surface-200 dark:hover:bg-dark-bg transition-colors"
                title={copiedEmoji === emoji ? "Copied!" : "Click to copy"}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
            {(CATEGORIES[activeCategory] || []).map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handleCopy(emoji)}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl hover:bg-surface-200 dark:hover:bg-dark-bg transition-colors"
                title={copiedEmoji === emoji ? "Copied!" : "Click to copy"}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {copiedEmoji && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-50 p-2 text-sm text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
          <span className="text-2xl">{copiedEmoji}</span>
          <span>Copied to clipboard!</span>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        Click any emoji to copy it to your clipboard.
      </p>
    </div>
  );
}
