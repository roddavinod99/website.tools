"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";

const BIP39_WORDS = [
  "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse",
  "access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act",
  "action","actor","actress","actual","adapt","add","addict","address","adjust","admit",
  "adult","advance","advice","aerobic","affair","afford","afraid","again","age","agent",
  "agree","ahead","aim","air","airport","aisle","alarm","album","alcohol","alert",
  "alien","all","alley","allow","almost","alone","alpha","already","also","alter",
  "always","amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger",
  "angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique",
  "anxiety","any","apart","apology","appear","apple","approve","april","arch","arctic",
  "area","arena","argue","arm","armed","armor","army","around","arrange","arrest",
  "arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset",
  "assist","assume","asthma","athlete","atom","attack","attend","attitude","attract","auction",
  "audit","august","aunt","author","auto","autumn","average","avocado","avoid","awake",
  "aware","awesome","awful","awkward","axis","baby","bachelor","bacon","badge","bag",
  "balance","balcony","ball","bamboo","banana","banner","bar","barely","bargain","barrel",
  "base","basic","basket","battle","beach","bean","beauty","because","become","beef",
  "before","begin","behave","behind","believe","below","belt","bench","benefit","best",
  "betray","better","between","beyond","bicycle","bid","bike","bind","biology","bird",
  "birth","bitter","black","blade","blame","blanket","blast","bleak","bless","blind",
  "blood","blossom","blow","blue","blur","blush","board","boat","body","boil",
  "bomb","bone","bonus","book","boost","border","boring","borrow","boss","bottom",
  "bounce","box","boy","bracket","brain","brand","brass","brave","bread","breeze",
  "brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze","broom",
  "brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb","bulk",
  "bullet","bundle","bunny","burden","burger","burst","bus","business","busy","butter",
  "buyer","buzz","cabbage","cabin","cable","cactus","cage","cake","call","calm",
  "camera","camp","can","canal","cancel","candy","cannon","canoe","canvas","canyon",
  "capable","capital","captain","car","carbon","card","cargo","carpet","carry","cart",
  "case","cash","casino","castle","casual","cat","catalog","catch","category","cattle",
  "caught","cause","caution","cave","ceiling","celery","cement","census","century","cereal",
  "certain","chair","chalk","champion","change","chaos","chapter","charge","chase","cheap",
  "check","cheese","chef","cherry","chest","chicken","chief","child","chimney","choice",
  "choose","chronic","chuckle","chunk","churn","citizen","city","civil","claim","clap",
  "clarify","claw","clay","clean","clerk","clever","cliff","climb","clinic","clip",
  "clock","clog","close","cloth","cloud","clown","club","clump","cluster","clutch",
  "coach","coast","coconut","code","coffee","coil","coin","collect","color","column",
  "combine","come","comfort","comic","common","company","concert","conduct","confirm","congress",
  "connect","consider","control","convince","cook","cool","copper","copy","coral","core",
  "corn","correct","cost","cotton","couch","country","couple","course","cousin","cover",
  "coyote","crack","cradle","craft","cram","crane","crash","crater","crawl","crazy",
  "cream","credit","creek","crew","cricket","crime","crisp","critic","crop","cross",
  "crouch","crowd","crucial","cruel","cruise","crumble","crush","cry","crystal","cube",
  "culture","cup","cupboard","curious","current","curtain","curve","cushion","custom","cute",
  "cycle","dad","damage","damp","dance","danger","daring","dash","daughter","dawn",
  "day","deal","debate","debris","decade","december","decide","decline","decorate","decrease",
  "deer","defense","define","defy","degree","delay","deliver","demand","demise","dentist",
  "deny","depart","depend","deposit","depth","deputy","derive","describe","desert","design",
  "desk","despair","destroy","detail","detect","develop","device","devote","diagram","dial",
  "diamond","diary","dice","diesel","diet","differ","digital","dignity","dilemma","dinner",
  "dinosaur","direct","dirt","disagree","discover","disease","dish","dismiss","disorder","display",
  "distance","divert","divide","divorce","dizzy","doctor","document","dog","doll","dolphin",
  "domain","donate","donkey","donor","door","dose","double","dove","draft","dragon",
  "drama","drastic","draw","dream","dress","drift","drill","drink","drip","drive",
  "drop","drum","dry","duck","dumb","dune","during","dust","dutch","duty",
  "dwarf","dynamic","eager","eagle","early","earn","earth","easily","east","easy",
  "echo","ecology","economy","edge","edit","educate","effort","egg","eight","either",
  "elbow","elder","electric","elegant","element","elephant","elevator","elite","else","embark",
  "embody","embrace","emerge","emotion","employ","empower","empty","enable","encourage","end",
  "endless","endorse","enemy","energy","enforce","engage","engine","enhance","enjoy","enlist",
  "enough","enrich","enroll","ensure","enter","entire","entry","envelope","episode","equal",
  "equip","era","erase","erode","erosion","error","erupt","escape","essay","essence",
  "estate","eternal","ethics","evidence","evil","evoke","evolve","exact","example","excess",
  "exchange","excite","exclude","excuse","execute","exercise","exhaust","exhibit","exile","exist",
  "exit","exotic","expand","expect","expire","explain","expose","express","extend","extra",
  "eye","eyebrow","fabric","face","faculty","fade","faint","faith","fall","false",
  "fame","family","famous","fan","fancy","fantasy","farm","fashion","fat","fatal",
  "father","fatigue","fault","favorite","feature","february","federal","fee","feed","feel",
  "female","fence","festival","fetch","fever","few","fiber","fiction","field","figure",
  "file","film","filter","final","find","fine","finger","finish","fire","firm",
  "fiscal","fish","fit","fitness","fix","flag","flame","flash","flat","flavor",
  "flee","flight","flip","float","flock","floor","flower","fluid","flush","fly",
  "foam","focus","fog","foil","fold","follow","food","foot","force","forest",
  "forget","fork","fortune","forum","forward","fossil","foster","found","fox","fragile",
  "frame","frequent","fresh","friend","fringe","frog","front","frost","frown","frozen",
  "fruit","fuel","fun","funny","furnace","fury","future","gadget","gain","galaxy",
  "gallery","game","gap","garage","garbage","garden","garlic","garment","gas","gasp",
  "gate","gather","gauge","gaze","general","genius","genre","gentle","genuine","gesture",
  "ghost","giant","gift","giggle","ginger","giraffe","girl","give","glad","glance",
  "glare","glass","glide","glimpse","globe","gloom","glory","glove","glow","glue",
  "goat","goddess","gold","good","goose","gorilla","gospel","gossip","govern","gown",
  "grab","grace","grain","grant","grape","grass","gravity","great","green","grid",
  "grief","grit","grocery","group","grow","grunt","guard","guess","guide","guilt",
  "guitar","gun","gym","habit","hair","half","hammer","hamster","hand","happy",
  "harbor","hard","harsh","harvest","hat","have","hawk","hazard","head","health",
  "heart","heavy","hedgehog","height","hello","helmet","help","hen","hero","hip",
  "hire","history","hobby","hockey","hold","hole","holiday","hollow","home","honey",
  "hood","hope","horn","horror","horse","hospital","host","hotel","hour","hover",
  "hub","huge","human","humble","humor","hundred","hungry","hunt","hurdle","hurry",
  "hurt","husband","hybrid","ice","icon","idea","identify","idle","ignore","ill",
  "illegal","illness","image","imitate","immense","immune","impact","impose","improve","impulse",
  "inch","include","income","increase","index","indicate","indoor","industry","infant","inflict",
  "inform","initial","inject","inmate","inner","innocent","input","inquiry","insane","insect",
  "inside","inspire","install","intact","interest","into","invest","invite","involve","iron",
  "island","isolate","issue","item","ivory","jacket","jaguar","jar","jazz","jealous",
  "jeans","jelly","jewel","job","join","joke","journey","joy","judge","juice",
  "jump","jungle","junior","junk","just","kangaroo","keen","keep","ketchup","key",
  "kick","kid","kidney","kind","kingdom","kiss","kit","kitchen","kite","kitten",
  "kiwi","knee","knife","knock","know","lab","label","labor","ladder","lady",
  "lake","lamp","language","laptop","large","later","latin","laugh","laundry","lava",
  "law","lawn","lawsuit","layer","lazy","leader","leaf","learn","leave","lecture",
  "left","leg","legal","legend","leisure","lemon","lend","length","lens","leopard",
  "lesson","letter","level","liberty","library","license","life","lift","light","like",
  "limb","limit","link","lion","liquid","list","little","live","lizard","load",
  "loan","lobster","local","lock","logic","lonely","long","loop","lottery","loud",
  "lounge","love","loyal","lucky","luggage","lumber","lunar","lunch","luxury","lyrics",
  "machine","mad","magic","magnet","maid","mail","main","major","make","mammal",
  "man","manage","mandate","mango","mansion","manual","maple","marble","march","margin",
  "marine","market","marriage","mask","mass","master","match","material","math","matrix",
  "matter","maximum","maze","meadow","mean","measure","meat","mechanic","medal","media",
  "melody","melt","member","memory","mention","menu","mercy","merge","merit","merry",
  "mesh","message","metal","method","middle","midnight","milk","million","mimic","mind",
  "minimum","minor","minute","miracle","mirror","misery","miss","mistake","mix","mixed",
  "mixture","mobile","model","modify","mom","moment","monitor","monkey","monster","month",
  "moon","moral","more","morning","mosquito","mother","motion","motor","mountain","mouse",
  "move","movie","much","muffin","mule","multiply","muscle","museum","mushroom","music",
  "must","mutual","myself","mystery","myth","naive","name","napkin","narrow","nasty",
  "nation","nature","near","neck","need","negative","neglect","neither","nephew","nerve",
  "nest","net","network","neutral","never","news","next","nice","night","noble",
  "noise","nominee","noodle","normal","north","nose","notable","nothing","notice","novel",
  "now","nuclear","number","nurse","nut","oak","obey","object","oblige","obscure",
  "observe","obtain","obvious","occur","ocean","october","odor","off","offer","office",
  "often","oil","okay","old","olive","olympic","omit","once","one","onion",
  "online","only","open","opera","opinion","oppose","option","orange","orbit","orchard",
  "order","ordinary","organ","orient","original","orphan","ostrich","other","outdoor","outer",
  "output","outside","oval","oven","over","own","owner","oxygen","oyster","ozone",
  "pact","paddle","page","pair","palace","palm","panda","panel","panic","panther",
  "paper","parade","parent","park","parrot","party","pass","patch","path","patient",
  "patrol","pattern","pause","pave","payment","peace","peanut","pear","peasant","pelican",
  "pen","penalty","pencil","people","pepper","perfect","permit","person","pet","phone",
  "photo","phrase","physical","piano","picnic","picture","piece","pig","pigeon","pill",
  "pilot","pink","pioneer","pipe","pistol","pitch","pizza","place","planet","plastic",
  "plate","play","please","pledge","pluck","plug","plunge","poem","poet","point",
  "polar","pole","police","pond","pony","pool","popular","portion","position","possible",
  "post","potato","pottery","poverty","powder","power","practice","praise","predict","prefer",
  "prepare","present","pretty","prevent","price","pride","primary","print","priority","prison",
  "private","prize","problem","process","produce","profit","program","project","promote","proof",
  "property","prosper","protect","proud","provide","public","pudding","pull","pulp","pulse",
  "pumpkin","punch","pupil","puppy","purchase","purity","purpose","purse","push","put",
  "puzzle","pyramid","quality","quantum","quarter","question","quick","quit","quiz","quote",
  "rabbit","raccoon","race","rack","radar","radio","rage","rail","rain","raise",
  "rally","ramp","ranch","random","range","rapid","rare","rate","rather","raven",
  "raw","razor","ready","real","reason","rebel","rebuild","recall","receive","recipe",
  "record","recycle","reduce","reflect","reform","region","regret","regular","reject","relax",
  "release","relief","rely","remain","remember","remind","remove","render","renew","rent",
  "reopen","repair","repeat","replace","report","require","rescue","resemble","resist","resource",
  "response","result","retire","retreat","return","reunion","reveal","review","reward","rhythm",
  "rib","ribbon","rice","rich","ride","ridge","rifle","right","rigid","ring",
  "riot","ripple","risk","ritual","rival","river","road","roast","robot","robust",
  "rocket","romance","roof","rookie","room","rose","rotate","rough","round","route",
  "royal","rude","rug","rule","run","runway","rural","sad","saddle","sadness",
  "safe","sail","salad","salmon","salon","salt","salute","same","sample","sand",
  "satisfy","satoshi","sauce","sausage","save","say","scale","scan","scare","scatter",
  "scene","scheme","school","science","scissors","scorpion","scout","scrap","screen","script",
  "scrub","sea","search","season","seat","second","secret","section","security","seed",
  "seek","segment","select","sell","seminar","senior","sense","sentence","series","service",
  "session","settle","setup","seven","shadow","shaft","shallow","share","shed","shell",
  "sheriff","shield","shift","shine","ship","shiver","shock","shoe","shoot","shop",
  "short","shoulder","shove","shrimp","shrug","shuffle","shy","sibling","sick","side",
  "siege","sight","sign","silent","silk","silly","silver","similar","simple","since",
  "sing","siren","sister","situate","six","size","skate","sketch","ski","skill",
  "skin","skirt","skull","slab","slam","sleep","slender","slice","slide","slight",
  "slim","slogan","slot","slow","slush","small","smart","smile","smoke","smooth",
  "snack","snake","snap","sniff","snow","soap","soccer","social","sock","soda",
  "soft","solar","soldier","solid","solution","solve","someone","song","soon","sorry",
  "sort","soul","sound","soup","source","south","space","spare","spatial","spawn",
  "speak","special","speed","spell","spend","sphere","spice","spider","spike","spin",
  "spirit","split","sponsor","spoon","sport","spot","spray","spread","spring","spy",
  "square","squeeze","squirrel","stable","stadium","staff","stage","stairs","stamp","stand",
  "start","state","stay","steak","steel","stem","step","stereo","stick","still",
  "sting","stock","stomach","stone","stool","story","stove","strategy","street","strike",
  "strong","struggle","student","stuff","stumble","style","subject","submit","subway","success",
  "such","sudden","suffer","sugar","suggest","suit","summer","sun","sunny","sunset",
  "super","supply","supreme","sure","surface","surge","surprise","surround","survey","suspect",
  "sustain","swallow","swamp","swap","swarm","swear","sweet","swim","swing","switch",
  "sword","symbol","symptom","syrup","system","table","tackle","tag","tail","talent",
  "talk","tank","tape","target","task","taste","tattoo","taxi","teach","team",
  "tell","ten","tenant","tennis","tent","term","test","text","thank","that",
  "theme","then","theory","there","they","thing","this","thought","three","thrive",
  "throw","thumb","thunder","ticket","tide","tiger","tilt","timber","time","tiny",
  "tip","tired","tissue","title","toast","tobacco","today","toddler","toe","together",
  "toilet","token","tomato","tomorrow","tone","tongue","tonight","tool","tooth","top",
  "topic","topple","torch","tornado","tortoise","toss","total","tourist","toward","tower",
  "town","toy","track","trade","traffic","tragic","train","transfer","trap","trash",
  "travel","tray","treat","tree","trend","trial","tribe","trick","trigger","trim",
  "trip","trophy","trouble","truck","true","truly","trumpet","trust","truth","try",
  "tube","tuna","tunnel","turkey","turn","turtle","twelve","twenty","twice","twin",
  "twist","two","type","typical","ugly","umbrella","unable","unaware","uncle","uncover",
  "under","undo","unfair","unfold","unhappy","uniform","union","unique","unit","universe",
  "unknown","unlock","until","unusual","unveil","update","upgrade","uphold","upon","upper",
  "upset","urban","usage","use","used","useful","useless","usual","utility","vacant",
  "vacuum","vague","valid","valley","valve","van","vanish","vapor","various","vast",
  "vault","vehicle","velvet","vendor","venture","venue","verb","version","very","vessel",
  "veteran","viable","vibrant","vicious","victory","video","view","village","vintage","violin",
  "virtual","virus","visa","visit","visual","vital","vivid","vocal","voice","void",
  "volcano","volume","vote","voyage","wage","wagon","wait","walk","wall","walnut",
  "want","warfare","warm","warrior","wash","wasp","waste","water","wave","way",
  "wealth","weapon","wear","weasel","weather","web","wedding","weekend","weird","welcome",
  "well","west","wet","whale","what","wheat","wheel","when","where","whip",
  "whisper","wide","width","wife","wild","will","win","window","wine","wing",
  "wink","winner","winter","wire","wisdom","wise","wish","witness","wolf","woman",
  "wonder","wood","wool","word","work","world","worry","worth","wrap","wreck",
  "wrestle","wrist","write","wrong","yard","year","yellow","you","young","youth",
  "zebra","zero","zone","zoo",
];

const BIP39_LANGUAGES: { id: string; label: string; url: string }[] = [
  { id: "english", label: "English", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt" },
  { id: "french", label: "French", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/french.txt" },
  { id: "italian", label: "Italian", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/italian.txt" },
  { id: "spanish", label: "Spanish", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/spanish.txt" },
  { id: "portuguese", label: "Portuguese", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/portuguese.txt" },
  { id: "czech", label: "Czech", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/czech.txt" },
  { id: "chinese_simplified", label: "Chinese (Simplified)", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/chinese_simplified.txt" },
  { id: "chinese_traditional", label: "Chinese (Traditional)", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/chinese_traditional.txt" },
  { id: "japanese", label: "Japanese", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/japanese.txt" },
  { id: "korean", label: "Korean", url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/korean.txt" },
];

const wordListCache: Record<string, string[]> = {};

async function fetchWordList(langId: string): Promise<string[]> {
  if (wordListCache[langId]) return wordListCache[langId];
  const lang = BIP39_LANGUAGES.find((l) => l.id === langId);
  if (!lang) return BIP39_WORDS;
  try {
    const resp = await fetch(lang.url);
    if (!resp.ok) return BIP39_WORDS;
    const text = await resp.text();
    const words = text.split("\n").map((w) => w.trim()).filter(Boolean);
    if (words.length === 2048) {
      wordListCache[langId] = words;
      return words;
    }
    return BIP39_WORDS;
  } catch {
    return BIP39_WORDS;
  }
}

function generateEntropyBytes(wordCount: 12 | 24): Uint8Array {
  const entropyBits = wordCount === 12 ? 128 : 256;
  const entropyBytes = entropyBits / 8;
  const arr = new Uint8Array(entropyBytes);
  crypto.getRandomValues(arr);
  return arr;
}

function bytesToBits(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(2).padStart(8, "0")).join("");
}

async function generateMnemonic(wordCount: 12 | 24, wordList: string[] = BIP39_WORDS): Promise<string> {
  const entropy = generateEntropyBytes(wordCount);
  const entropyBits = bytesToBits(entropy);

  const checksumBitsCount = wordCount === 12 ? 4 : 8;
  const hashBuf = await crypto.subtle.digest("SHA-256", new Uint8Array(entropy));
  const hashBits = bytesToBits(new Uint8Array(hashBuf));
  const checksum = hashBits.slice(0, checksumBitsCount);

  const allBits = entropyBits + checksum;
  const words: string[] = [];

  for (let i = 0; i < allBits.length; i += 11) {
    const index = parseInt(allBits.slice(i, i + 11), 2);
    words.push(wordList[index]);
  }

  return words.join(" ");
}

async function mnemonicToSeed(mnemonic: string, passphrase: string = ""): Promise<string> {
  const encoder = new TextEncoder();
  const mnemonicBytes = encoder.encode(mnemonic.normalize("NFKD"));
  const salt = encoder.encode(("mnemonic" + passphrase).normalize("NFKD"));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    mnemonicBytes,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 2048,
      hash: "SHA-512",
    },
    keyMaterial,
    512
  );

  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function Bip39Generator() {
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [count, setCount] = useState(1);
  const [mnemonics, setMnemonics] = useState<{ mnemonic: string; seed: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState("");
  const [language, setLanguage] = useState("english");

  const generate = useCallback(async () => {
    setGenerating(true);
    const wordList = await fetchWordList(language);
    const results: { mnemonic: string; seed: string }[] = [];
    for (let i = 0; i < count; i++) {
      const mnemonic = await generateMnemonic(wordCount, wordList);
      const seed = await mnemonicToSeed(mnemonic);
      results.push({ mnemonic, seed });
    }
    setMnemonics(results);
    setGenerating(false);
  }, [wordCount, count, language]);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Word Count</label>
          <div className="flex gap-2">
            {([12, 24] as const).map((wc) => (
              <button key={wc} onClick={() => setWordCount(wc)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  wordCount === wc
                    ? "bg-brand-500 text-white"
                    : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
                }`}>
                {wc} words
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Count</label>
          <input type="number" min={1} max={20} value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
            {BIP39_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>
        <button onClick={generate} disabled={generating}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>

      {mnemonics.map((item, idx) => (
        <div key={idx} className="space-y-2 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          {mnemonics.length > 1 && (
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">Mnemonic #{idx + 1}</p>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Mnemonic ({wordCount} words)</span>
              <button onClick={() => copyToClipboard(item.mnemonic, `mnemonic-${idx}`)}
                className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
                <Copy size={12} /> {copied === `mnemonic-${idx}` ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-white border border-surface-200 dark:bg-dark-bg dark:border-dark-border">
              {item.mnemonic.split(" ").map((word, wi) => (
                <span key={wi} className="inline-flex items-center gap-1 rounded bg-surface-100 px-2 py-0.5 text-xs dark:bg-dark-surface">
                  <span className="text-[10px] text-surface-400 dark:text-dark-muted font-mono w-4 text-right">{wi + 1}</span>
                  <span className="font-mono text-surface-800 dark:text-dark-text">{word}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Seed (hex, 512-bit)</span>
              <button onClick={() => copyToClipboard(item.seed, `seed-${idx}`)}
                className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
                <Copy size={12} /> {copied === `seed-${idx}` ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="block text-[11px] font-mono text-surface-700 dark:text-dark-text break-all select-all p-2 rounded-lg bg-white border border-surface-200 dark:bg-dark-bg dark:border-dark-border">
              {item.seed}
            </code>
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">About BIP39</p>
        <p className="text-xs text-surface-600 dark:text-dark-text">
          BIP39 defines a standard for generating mnemonic phrases from random entropy. The mnemonic is converted to a 512-bit seed using PBKDF2-SHA512 (2048 iterations), which serves as the master key for hierarchical deterministic (HD) wallets.
        </p>
      </div>
    </div>
  );
}
