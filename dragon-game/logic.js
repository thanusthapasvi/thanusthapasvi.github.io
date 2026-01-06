/* 3D Objects containers */
/* Main Game Window */
const game = document.querySelector(".game-window");

/* Lucky Box */
const giftContainer = document.querySelector(".box");

/* Monster Box */
const monsterContainer = document.querySelector(".monster-container");

/* 3D setup */
const loader = new THREE.GLTFLoader();
// for world
const worldScene = new THREE.Scene();
worldScene.background = new THREE.Color(0x000000);

const gameWidth = game.clientWidth;
const gameHeight = game.clientHeight;

const worldCamera = new THREE.PerspectiveCamera(60, gameWidth / gameHeight, 0.1, 100);
worldCamera.position.set(0, 2, 1.9);
const worldRenderer = new THREE.WebGLRenderer({ antialias: true });
worldRenderer.setSize(gameWidth, gameHeight);
game.appendChild(worldRenderer.domElement);

const world = new THREE.Group();
worldScene.add(world);

// world lights
worldScene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(0, 2.5, 2);
worldScene.add(sun);

const moon = new THREE.DirectionalLight(0xffffff, 0.3);
moon.position.set(0, 2.5, 2);
worldScene.add(moon);

const shopLight1 = new THREE.PointLight(0xffaa33, 3, 5); // color, intensity, distance
shopLight1.position.set(0, 2.5, -11.5);
world.add(shopLight1);
const shopLight2 = new THREE.PointLight(0xffaa33, 2, 2);
shopLight2.position.set(-1, 0.5, -11.3);
world.add(shopLight2);
const shopLight3 = new THREE.PointLight(0xffaa33, 2, 2);
shopLight3.position.set(1, 0.5, -11.3);
world.add(shopLight3);
const shopLight4 = new THREE.PointLight(0xffffff, 3, 5);
shopLight4.position.set(-3, 1, -9);
world.add(shopLight4);
const shopLight5 = new THREE.PointLight(0xffffff, 3, 5);
shopLight5.position.set(3, 1, -9);
world.add(shopLight5);


const dragonLight1 = new THREE.PointLight(0xff33ff, 10, 5);
dragonLight1.position.set(7, 3.5, 5.5);
world.add(dragonLight1);
const dragonLight2 = new THREE.PointLight(0xff33ff, 5, 5);
dragonLight2.position.set(9, 2.5, 3);
world.add(dragonLight2);

// const lightHelper = new THREE.PointLightHelper(dragonLight1, 0.2);
// worldScene.add(lightHelper);

// loading world model
loader.load(
    "models/gameWorld.glb",
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        console.log("WORLD LOADED", model);
        world.add(model);

        setupTorches(model);
    },
    undefined,
    (err) => console.error("WORLD ERROR", err)
);
//torches
function setupTorches(root) {
    const torchNames = ["torch1", "torch2", "torch3"];

    torchNames.forEach((name) => {
        const torch = root.getObjectByName(name);
        if (torch) {
            createTorchFire(torch);
        } else {
            console.warn(`Torch not found: ${name}`);
        }
    });
}
const torchFires = [];
function createTorchFire(torchEmpty) {
    const fireLight = new THREE.PointLight(0xffaa33, 2.5, 6);
    fireLight.position.set(0, 0.5, 0); // EMPTY origin
    torchEmpty.add(fireLight);

    const fireTex = new THREE.TextureLoader().load("assests/fire.png");
    const fireMat = new THREE.SpriteMaterial({
        map: fireTex,
        transparent: true
    });

    const fire = new THREE.Sprite(fireMat);
    fire.scale.set(2, 2, 2);
    fire.position.set(0, 0, 0); // EXACTLY at EMPTY
    torchEmpty.add(fire);

    torchFires.push({ fireLight, fire });
}

//rotation and navigation
let targetRotation = 0;
const mainButton = document.querySelector(".main-button");
mainButton.onclick = goShop; //starting
const leftButton = document.querySelector(".left-button");
const rightButton = document.querySelector(".right-button");

function rotateWorld(direction) {
    if (direction === "left") {
        if (Math.abs(targetRotation == 0))
            targetRotation = THREE.MathUtils.degToRad(-120);
        else if (Math.abs(targetRotation - THREE.MathUtils.degToRad(120)) < 0.001)
            targetRotation = THREE.MathUtils.degToRad(0);
        else if (Math.abs(targetRotation - THREE.MathUtils.degToRad(-120)) < 0.001)
            targetRotation = THREE.MathUtils.degToRad(120);
    }
    else if (direction === "right") {
        if (Math.abs(targetRotation == 0))
            targetRotation = THREE.MathUtils.degToRad(120);
        else if (Math.abs(targetRotation - THREE.MathUtils.degToRad(120)) < 0.001)
            targetRotation = THREE.MathUtils.degToRad(-120);
        else if (Math.abs(targetRotation - THREE.MathUtils.degToRad(-120)) < 0.001)
            targetRotation = THREE.MathUtils.degToRad(0);
    }
    navigate();
}
window.addEventListener("keydown", (e) => {
    if(isShopOpen || isHeroOpen || isInventoryOpen || isPageOpen) {
        return;
    }
    closeAll();
    if (e.key.toLowerCase() === "a") {
        rotateWorld("left");
    }
    if (e.key.toLowerCase() === "d") {
        rotateWorld("right");
    }
});
leftButton.addEventListener("click", () => {
    closeAll();
    rotateWorld("left");
});
rightButton.addEventListener("click", () => {
    closeAll();
    rotateWorld("right");
});

function closeAll() {
    if(isShopOpen)
        goShop();
    if(isHeroOpen)
        openHero();
    if(isInventoryOpen)
        openInventory();
    pageWindow.style.display = "none";
}

//resize
window.addEventListener("resize", () => {
    worldCamera.aspect = game.clientWidth / game.clientHeight;
    worldCamera.updateProjectionMatrix();
    worldRenderer.setSize(game.clientWidth, game.clientHeight);
});

// for monsters and gift box
const scene = new THREE.Scene(); // for monsters and giftbox
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
/* using renderer.setSize() in functions for reuse. */
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(-0.5, -0.5, 2);
scene.add(light);
const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
light2.position.set(0.5, 0.5, 2);
scene.add(light2);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

/* Camera and attaching to conatineer (gift) or Monster container */
let activeCamera;
let activeModel = null;

let giftCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
giftCamera.position.set(0.75, 0.75, 1.5);

let monsterCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
monsterCamera.position.set(0.2, 0.2, 1.5);


function initCameraForContainer(camera, container) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);

    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    activeCamera = camera;
}

/* for 3d lucky box */
let gift, lid, bottom;
function loadGiftBox() {
    if (activeModel) {
        scene.remove(activeModel);
        activeModel = null;
    }

    loader.load("models/GiftBox.glb", gltf => {
        gift = gltf.scene;

        lid = gift.getObjectByName("GiftLid");
        bottom = gift.getObjectByName("GiftBottom");

        gift.scale.set(1.5, 1.5, 1.5);

        console.log("Gift loaded:", gift);
        console.log("Gift position:", gift.position);
        console.log("Gift scale:", gift.scale);
        console.log("Gift rotation:", gift.rotation);
        
        activeModel = gift;
        scene.add(activeModel);
    });
}

/* For 3D Monster */
let monster;
function loadMonsterModel(name) {
    if (activeModel) {
        scene.remove(activeModel);
        activeModel = null;
    }

    loader.load("models/" + name + ".glb", gltf => {
        monster = gltf.scene;

        monster.scale.set(monsters[fighting].scaleX, monsters[fighting].scaleY, monsters[fighting].scaleZ);

        monster.userData.baseScale = monster.scale.clone();

        activeModel = monster;
        scene.add(activeModel);
    },
        undefined,
    error => {
        console.error("Failed to load monster model:", error);

        monsterImage.style.display = "block";
        monsterImage.src = monsters[fighting].image;
    });
}

/* 3d animation loops */
let lidState = 0; 
let t = 0;
function animate() {
    requestAnimationFrame(animate);

    // world aniamtions
    world.rotation.y += (targetRotation - world.rotation.y) * 0.1;

    torchFires.forEach(({ fireLight, fire }) => {
        fireLight.intensity = 2.5 + Math.random() * 0.6;
        fire.scale.y = 1 + Math.sin(Date.now() * 0.015) * 0.1;
    });

    // gift box animations
    if (lidState === 1) {
        // Opening
        t += 0.05;
        lid.position.y = Math.sin(t) * 0.3;
        
        if (t >= 0.6) lidState = 2;
        gift.rotation.y += 0.25;
    } 
    else if (lidState === 2) {
        // Closing
        t -= 0.05;
        lid.position.y = Math.sin(t) * 0.3;
        
        if (t <= 0) lidState = 0;
        gift.rotation.y += 0.25;
    }

    // monster (Slime) aniations
    if(monster) {
        const t = performance.now() * 0.002;

        const s = 1 + Math.sin(t * 2) * 0.04;
        const base = monster.userData.baseScale;
        monster.scale.set(
            base.x * s,
            base.y * (1 - (s - 1)),
            base.z * s
        );
    }

    if (activeCamera && renderer.domElement.parentNode) {
        renderer.render(scene, activeCamera);
    }

    worldRenderer.render(worldScene, worldCamera);
}
animate();
function playLidAnimation() {
    if (lidState === 0) {
        lidState = 1;
        t = 0;
    }
}

/* Loading... */
window.addEventListener("load", () => {
	const loader = document.getElementById("loader-overlay");
	loader.classList.add("hidden");
	setTimeout(() => loader.remove(), 400);
});

/* Main game Start */
let gold;
let xp;
let level;
let maxHealth;
let health;
let currentWeapon;
let currentHero;
let inventory;

const weapons = [
    { name: 'stick', power: 5 },
    { name: 'dagger', power: 30 },
    { name: 'hammer', power: 50 },
    { name: 'iron sword', power: 100 },
    { name: 'diamond sword', power: 120 }
]; //for this down one
const inventoryDefaultSave = [
    {
        name: weapons[0].name,
        quantity: 1
    },
    {
        name: weapons[1].name,
        quantity: 0
    },
    {
        name: weapons[2].name,
        quantity: 0
    },
    {
        name: weapons[3].name,
        quantity: 0
    },
    {
        name: weapons[4].name,
        quantity: 0
    }
];
function resetToDefaults() {
    gold = 50;
    xp = 0;
    level = 1;
    maxHealth = 100;
    health = 100;
    currentWeapon = 0;
    currentHero = 0;
    inventory = structuredClone(inventoryDefaultSave);
}
resetToDefaults();

const SAVE_KEY = "dragonGameSave";
function getGameState() {
    return {
        gold,
        xp,
        level,
        maxHealth,
        health,
        currentWeapon,
        currentHero,
        inventory
    };
}
function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(getGameState()));
    console.log("saved Game Successfully");
}
function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if(!raw) {
            resetToDefaults();
            return;
        }
        const save = JSON.parse(raw);

        gold = Number(save.gold) || 50;
        xp = Number(save.xp) || 0;
        level = Number(save.level) || 1;
        maxHealth = Number(save.maxHealth) || 100;
        health = Number(save.health) || 100;
        currentWeapon = Number(save.currentWeapon) || 0;
        currentHero = Number(save.currentHero) || 0;
        inventory = Array.isArray(save.inventory) ? save.inventory.map(item => ({
            name: item.name,
            quantity: Math.max(item.name === "stick" ? 1 : 0, Number(item.quantity) || 0)
        })) : structuredClone(inventoryDefaultSave);
    } catch {
        console.warn("Savee is goneeeeeeee");
        localStorage.removeItem(SAVE_KEY);
    }
}
loadGame(); //to load game and assign varirables

let fighting;
let monsterHealth;

let isHeroOpen = false;
let isInventoryOpen = false;

const gameHero = document.querySelector(".game");
const gameLucky = document.querySelector(".lucky-box");

const dialog = document.querySelector(".dialog");
const inventoryWindow = document.querySelector(".inventory-box");
const heroImage = document.querySelector(".hero-image");
const monsterImage = document.querySelector(".monster-image");
const shopPageWindow = document.querySelector(".shop-page-box");
const pageWindow = document.querySelector(".page-box");
const heroWindow = document.querySelector(".hero-profile");

const heroLevelText = document.querySelector(".info-level");

const back = document.querySelector('.top-button1');
const shop = document.querySelector('.top-button2');
const bag = document.querySelector('.top-button3');
const hero = document.querySelector('.top-button4');

const goldText = document.querySelector(".goldText");
const xpText = document.querySelector(".xpText");
const levelText = document.querySelector(".levelText");
const healthText = document.querySelector(".healthText");

const heroBattleStats = document.querySelector(".hero-battle-stats");
const heroBattleName = document.querySelector(".heroName");
const heroBattleLevel = document.querySelector(".heroLevel");
const heroBattleSkills = document.querySelector(".hero-skills");

const monsterStats = document.querySelector(".monster-battle-stats");
const monsterName = document.querySelector(".monsterName");
const monsterLevel = document.querySelector(".monsterLevel");

const monsterDamageText = document.querySelector(".monster-damage");
const heroDamageText = document.querySelector(".hero-damage");
const energyBox = document.querySelector(".energy-box");

const energyFlow = document.querySelector(".energy-flow-box");
let energy = 0;
const MAX_ENERGY = 100;
const REFILL_RATE = 0.008;
let lastTime = performance.now();

function textUpdates() {
    goldText.innerText = gold;
    xpText.innerText = xp;
    levelText.innerText = level;
    healthText.innerText = maxHealth;
}
textUpdates();

const monsters = [
    {
        name: "slime",
        level: 3,
        health: 100,
        image: "assests/slime.png",
        scaleX: 0.7,
        scaleY: 0.5,
        scaleZ: 0.5
    },
    {
        name: "slime group",
        level: 10,
        health: 300,
        image: "assests/slimeGroup.png",
        scaleX: 0.4,
        scaleY: 0.4,
        scaleZ: 0.2
    },
    {
        name: "beast",
        level: 15,
        health: 450,
        image: "assests/beast1.png",
        scaleX: 0.8,
        scaleY: 0.6,
        scaleZ: 0.75
    },
    {
        name: "dragon",
        level: 50,
        health: 800,
        image: "assests/dragon.png",
        scaleX: 0.8,
        scaleY: 0.6,
        scaleZ: 0.75
    }
]
const heroSkills = [
    {
        skillId: 0,
        name: "Sword Slash",
        energyCost: 20,
        power: 15,
        skillClass: "skill0",
        imgSrc: "assests/skill0.png"
    },
    {
        skillId: 1,
        name: "Energy Slash",
        energyCost: 40,
        power: 50,
        skillClass: "skill1",
        imgSrc: "assests/skill1.png"
    },
    {
        skillId: 2,
        name: "Multi Cut",
        energyCost: 40,
        power: 40,
        skillClass: "skill2",
        imgSrc: "assests/skill2.png"
    }
]
const heros = [
    {
        name: "RPG Kight",
        normalSkill: 0,
        energySkill: 1,
        attackPower: 50,
        skills: [0, 1, 2]
    }
]
const locations = [
    {
        name: "Hero",
        text: "You are in the town. You see a sign that says \"Shop\".",
        bg: "url('assests/town.jpg')",
        rotation: 0
    },
    {
        name: "cave",
        text: "You enter the cave. You see some monsters.",
        bg: "url('assests/cave.png')",
        rotation: -120
    },
    {
        name: "fight",
        text: "You are fighting a monster.",
        bg: "url('assests/battle.jpg')",
        rotation: -120
    },
    {
        name: "kill monster",
        text: 'The monster screams "Arg!" as it dies.',
        bg: "url('assests/battle.jpg')",
        rotation: -120
    },
    {
        name: "lose",
        text: "Game Over. You die. &#x2620;",
        bg: "url('assests/battle.jpg')",
        rotation: -120
    },
    {
        name: "win",
        text: "You defeat the dragon! YOU WIN THE GAME! &#x1F389;",
        bg: "url('assests/battle.jpg')",
        rotation: -120
    }
];
function bestWeapon() {
    let best = 0;
    for (let i = inventory.length - 1; i >= 0; i--) {
        const cur = inventory[i];
        if (cur.quantity > 0) {
            best = i;
            break;
        }
    }
    return best;
}
currentWeapon = bestWeapon();
updateHero();

//attacks

function skillButtons() {
    const skillIcons = document.querySelectorAll(".skills");
    skillIcons[0].onclick = () => attack(heros[currentHero].skills[0]);
    skillIcons[1].onclick = () => attack(heros[currentHero].skills[1]);
    skillIcons[2].onclick = () => attack(heros[currentHero].skills[2]);
    skillIcons[3].onclick = goTown;

    const skillCosts = document.querySelectorAll(".skill-cost");
    skillCosts[0].innerText = heroSkills[heros[currentHero].skills[0]].energyCost / 20;
    skillCosts[1].innerText = heroSkills[heros[currentHero].skills[1]].energyCost / 20;
    skillCosts[2].innerText = heroSkills[heros[currentHero].skills[2]].energyCost / 20;

    const placeHolder = "assests/placeholder.png";
    const skillImages = document.querySelectorAll(".skill-image");
    for (let i = 0; i < skillImages.length - 1; i++) {
        const skillIndex = heros[currentHero].skills[i];
        const src = heroSkills[skillIndex]?.imgSrc || placeHolder;
        skillImages[i].src = src;
        skillImages[i].onerror = () => {
            skillImages[i].src = placeHolder;
        };
    }
    // skillImages[0].src = heroSkills[heros[currentHero].skills[0]].imgSrc || placeHolder;
    // skillImages[1].src = heroSkills[heros[currentHero].skills[1]].imgSrc || placeHolder;
    // skillImages[2].src = heroSkills[heros[currentHero].skills[2]].imgSrc || placeHolder;
}
skillButtons();
let isPageOpen = false;
function update(location) {
    monsterStats.style.display = "none";
    heroBattleStats.style.display = "none";
    heroBattleSkills.style.display = "none";
    inventoryWindow.style.display = "none";
    heroWindow.style.display = "none";
    heroImage.style.display = "none";
    monsterImage.style.display = "none";
    monsterContainer.style.display = "none";
    heroDamageText.style.display = "none";
    monsterDamageText.style.display = "none";
    dialog.style.display = "block";
    shop.classList.remove("active-tab");
    hero.classList.remove('active-tab');
    bag.classList.remove('active-tab');
    game.style.background = location["bg"];
    energyBox.style.display = "none";

    if (location.name == "cave") {
        pageWindow.style.display = "flex";
        monstersPage();
        isPageOpen = true;
        closeNavButton();
    } else {
        pageWindow.style.display = "none";
        shopPageWindow.style.display = "none";
        isPageOpen = false;
        closeNavButton();
    }
    
    if(location.name == "fight") {
        energy = 0;
        leftButton.style.display = "none";
        rightButton.style.display = "none";
        mainButton.style.display = "none";
        worldRenderer.domElement.style.display = "none"; //to hide 3d world in fight
    } else {
        leftButton.style.display = "block";
        rightButton.style.display = "block";
        mainButton.style.display = "block";
        worldRenderer.domElement.style.display = "block";
    }
    if(location.name === "lose" || location.name === "win") {
        gameOverPop(location.name);
    } else {
        saveGame();
    }
    dialog.innerHTML = location.text;
}
function monstersPage() {
    const pageTiles = document.querySelectorAll('.page-item');
    const p1s = document.querySelectorAll('.page-item-name');
    const p2s = document.querySelectorAll('.page-item-level');
    const imgs = document.querySelectorAll('.page-item-image');
    pageTiles.forEach(tile => {
        tile.classList.add('appear');
    });
    setTimeout(() => {
        pageTiles.forEach(tile => {
            tile.classList.remove('appear');
        });
    }, 400);

    p1s[0].innerText = monsters[0].name;
    p1s[1].innerText = monsters[1].name;
    p1s[2].innerText = monsters[2].name;
    p2s[0].innerText = "level " + monsters[0].level;
    p2s[1].innerText = "level " + monsters[1].level;
    p2s[2].innerText = "level " + monsters[2].level;
    imgs[0].src = monsters[0].image;
    imgs[1].src = monsters[1].image;
    imgs[2].src = monsters[2].image;
    pageTiles[0].onclick = fightSlime;
    pageTiles[1].onclick = fightSlimeGroup;
    pageTiles[2].onclick = fightBeast;
}
function closeNavButton() {
    const navLayer = document.querySelector(".nav-layer");
    const shouldHide = isShopOpen || isHeroOpen || isInventoryOpen || isPageOpen;
    if(window.innerWidth < 750) {
        navLayer.style.display = shouldHide ? "none" : "block";
    }
}

function goTown() {
    update(locations[0]);
    targetRotation = 0;
    navigate()
}

let isShopOpen = false;
function goShop() {
    goTown();

    const shopPageTiles = document.querySelectorAll('.shop-page-item');
    shopPageTiles[0].onclick = buyHealthRegen;
    shopPageTiles[1].onclick = buyHealth;
    shopPageTiles[2].onclick = buyWeapon;
    shopPageTiles[3].onclick = buyLucky;

    isHeroOpen = false;
    isInventoryOpen = false;
    if(isShopOpen) {
        shop.classList.remove("active-tab");
        shopPageWindow.style.display = "none";
        isShopOpen = false;
        closeNavButton();
    } else {
        shopPageWindow.style.display = "block";
        shopPageWindow.classList.remove('floating-ani');
        shop.classList.add("active-tab");
        setTimeout(() => {
            shopPageWindow.classList.add('floating-ani');
        }, 500);

        shopPageTiles.forEach(tile => {
            tile.classList.add('appear');
        });
        setTimeout(() => {
            shopPageTiles.forEach(tile => {
                tile.classList.remove('appear');
            });
        }, 400);
        dialog.innerText = "You Enter Shop";
        isShopOpen = true;
        closeNavButton();
    }
}

function goCave() {
    playTeleportAudio();
    update(locations[1]);
}

function fightSlime() {
    fighting = 0;
    fightTimeOut();
}
function fightSlimeGroup() {
    fighting = 1;
    fightTimeOut();
}
function fightBeast() {
    fighting = 2;
    fightTimeOut();
}
function fightDragon() {
    fighting = 3;
    fightTimeOut();
}

function fightTimeOut() {
    //to play animation of bounse for page tiles in cave
    setTimeout(() => {
        goFight();
    }, 400);
}

function openInventory() {
    goTown();
    updateInventory();
    isHeroOpen = false;
    isShopOpen = false;
    if (isInventoryOpen) {
        inventoryWindow.style.display = "none";
        bag.classList.remove('active-tab');
        isInventoryOpen = false;
        dialog.style.display = "block";
        closeNavButton();
    } else {
        inventoryWindow.classList.remove('floating-ani');
        inventoryWindow.style.display = "flex";
        isInventoryOpen = true;
        setTimeout(() => {
            inventoryWindow.classList.add('floating-ani');
        }, 500);
        bag.classList.add('active-tab');
        dialog.style.display = "none";
        closeNavButton();
    }
}
function openHero() {
    goTown();
    updateHero();
    isInventoryOpen = false;
    isShopOpen = false;
    if (isHeroOpen) {
        heroWindow.style.display = "none";
        hero.classList.remove('active-tab');
        isHeroOpen = false;
        dialog.style.display = "block";
        closeNavButton();
    } else {
        heroWindow.classList.remove('floating-ani');
        heroWindow.style.display = "flex";
        isHeroOpen = true;
        hero.classList.add('active-tab');
        dialog.style.display = "none";
        closeNavButton();
        setTimeout(() => {
            heroWindow.classList.add('floating-ani');
        }, 500);
    }
}

function navigate() {
    const navigations = [
        {
            angle: 0,
            text: ["Cave", "Dragon"],
            func: goShop,
            buttonText: "Enter Shop"
        },
        {
            angle: 120,
            text: ["Town", "Cave"],
            func: fightDragon,
            buttonText: "Fight Dragon"
        },
        {
            angle: -120,
            text: ["Dragon", "Town"],
            func: goCave,
            buttonText: "Enter Cave"
        }
    ]
    let currentNav = navigations.find(nav => {
        return Math.abs(THREE.MathUtils.degToRad(nav.angle) - targetRotation) < 0.001;
    });

    mainButton.onclick = currentNav.func;
    mainButton.innerText = currentNav.buttonText;
    leftButton.innerText = currentNav.text[0];
    rightButton.innerText = currentNav.text[1];
}

function updateInventory() {
    const stickText = document.querySelector(".weapon1-quanity");
    const daggerText = document.querySelector(".weapon2-quanity");
    const hammerText = document.querySelector(".weapon3-quanity");
    const ironSwordText = document.querySelector(".weapon4-quanity");
    const diamondSwordText = document.querySelector(".weapon5-quanity");

    const weaponHighlight = document.querySelectorAll(".weapons");

    stickText.innerText = inventory[0].quantity;
    daggerText.innerText = inventory[1].quantity;
    hammerText.innerText = inventory[2].quantity;
    ironSwordText.innerText = inventory[3].quantity;
    diamondSwordText.innerText = inventory[4].quantity;

    weaponHighlight[currentWeapon].classList.add("current-weapon-highlight");
    for (let i = 0; i < weaponHighlight.length; i++) {
        if (i != currentWeapon) {
            weaponHighlight[i].classList.remove("current-weapon-highlight");
        }
    }
    saveGame();
}
function updateHero() {
    updateLevel();
    const heroNameText = document.querySelector(".hero-name");
    const heroWeaponText = document.querySelector(".info-weapon");

    heroNameText.innerText = heros[currentHero].name;
    heroWeaponText.innerText = weapons[currentWeapon].name;
}

function buyHealthRegen() {
    if(health != maxHealth) {
        if(gold >= 10) {
            playBuySuccessAudio();
            const prevGold = gold;
            gold -= 10;
            health = maxHealth;
            animateNumber(goldText, prevGold, gold);
            iconsPulse("coinIcon");
            saveGame();
        } else {
            playBuyFailAudio();
            dialog.innerText = "You do not have enough gold to buy health regen.";
        }
    } else {
        playBuyFailAudio();
        dialog.innerText = "You already have full health";
    }
}
function buyHealth() {
    if (gold >= 20) {
        playBuySuccessAudio();
        const prevHealth = maxHealth;
        const prevGold = gold;
        gold -= 20;
        maxHealth += 10;
        health = maxHealth;
        animateNumber(goldText, prevGold, gold);
        iconsPulse("coinIcon");
        animateNumber(healthText, prevHealth, maxHealth);
        iconsPulse("healthIcon");
        saveGame();
    } else {
        playBuyFailAudio();
        dialog.innerText = "You do not have enough gold to buy max health.";
    }
}
function buyWeapon() {
    if (gold >= 30) {
        playBuySuccessAudio();
        const prevGold = gold;
        gold -= 30;
        animateNumber(goldText, prevGold, gold);
        iconsPulse("coinIcon");
        let newWeapon = weapons[1].name;
        dialog.innerText = "You now have a " + newWeapon + ".";
        addWeapon(newWeapon);
        dialog.innerText += " inventory updated ";
        saveGame();
    } else {
        playBuyFailAudio();
        dialog.innerText = "You do not have enough gold to buy a weapon.";
    }
}
function buyLucky() {
    if (gold >= 200) {
        playBuySuccessAudio();
        gold -= 200;
        goldText.innerText = gold;
        gameHero.style.display = "none";
        gameLucky.style.display = "flex";
        initCameraForContainer(giftCamera, giftContainer);
        loadGiftBox();
    } else {
        playBuyFailAudio();
        dialog.innerText = "You dont have enough gold";
    }
}
function gainGold(amount) {
    const prevGold = gold;
    gold += amount;
    animateNumber(goldText, prevGold, gold);
    iconsPulse("coinIcon");
    playBuySuccessAudio();
    saveGame();
}
function addWeapon(name) {
    const item = inventory.find(i => i.name === name);
    if (item) {
        item.quantity++;
        saveGame();
    } else
        console.log("Error adding weapon");

    upgradeWeapons();
}
function upgradeWeapons() {
    const item1 = inventory[1];
    const item2 = inventory[2];
    const item3 = inventory[3];
    const item4 = inventory[4];
    if (item1.quantity == 2) {
        item1.quantity -= 2;
        item2.quantity++;
    }
    if (item2.quantity == 3) {
        item2.quantity -= 3;
        item3.quantity++;
    }
    if (item3.quantity == 4) {
        item3.quantity -= 4;
        item4.quantity++;
    }
    currentWeapon = bestWeapon();
    saveGame();
}

function energyLoop(time) {
    const delta = time - lastTime;
    lastTime = time;

    energy = Math.min(
        energy + delta * REFILL_RATE, MAX_ENERGY
    );

    energyPulseAnimation();
    updateEnergyUI();
    skillEnergyCooldown();
    requestAnimationFrame(energyLoop);
}
requestAnimationFrame(energyLoop);
function updateEnergyUI() {
    energyFlow.style.background = `linear-gradient(to right, var(--accent-2) ${energy}%, #555 ${energy}%)`;
}
function useEnergy(cost) {
    if (energy < cost) {
        console.log("Not enough elixir ❌");
        return false;
    }
    energy -= cost;
    console.log(`Used ${cost} energy ⚔️`);
    return true;
}
function energyPulseAnimation() {
    const energySegments = document.querySelectorAll(".energy-segment");
    let segmentIndex = Math.floor(energy / 20);
    if(segmentIndex < 0 || segmentIndex >= energySegments.length) return;

    const segment = energySegments[segmentIndex];
    segment.style.animation = "none";
    segment.offsetHeight; // force reflow
    segment.style.animation = "energyPulse 0.4s ease-in-out";
}
function skillEnergyCooldown() {
    const cooldowns = document.querySelectorAll(".skill-cooldown");
    for(let i = 0; i < 3; i++) {
        const skillCooldown = Math.min(energy / heroSkills[heros[currentHero].skills[i]].energyCost * 100, 100);
        cooldowns[i].style.background = `conic-gradient(from 0deg at 50% 50%, transparent ${skillCooldown}%, rgba(0, 0, 0, 0.5) ${skillCooldown}%)`;
    }
}

function goFight() {
    update(locations[2]);

    monsterHealth = monsters[fighting].health;

    monsterName.innerText = monsters[fighting].name;
    monsterLevel.innerText = monsters[fighting].level;

    heroBattleName.innerText = heros[currentHero].name;
    heroBattleLevel.innerText = level;

    monsterStats.style.display = "flex";
    heroBattleStats.style.display = "flex";
    heroBattleSkills.style.display = "grid";
    heroImage.style.display = "block";
    energyBox.style.display = "flex";
    monsterContainer.style.display = "block";

    initCameraForContainer(monsterCamera, monsterContainer);
    loadMonsterModel(monsters[fighting].name);

    monsterProgress(monsterHealth);
    playerProgress(health);
}

function monsterProgress(hp) {
    const monsterHpText = document.querySelector(".monster-hp");
    const monsterCurrentHealth = document.querySelector(".monster-progress");
    let monsterPercent;
    if(hp > 0)
        monsterPercent = (hp / monsters[fighting].health) * 100;
    else
        monsterPercent = 1;
    monsterCurrentHealth.style.width = monsterPercent + "%";
    monsterHpText.innerText = (hp > 0 ? hp : 0) + " / " + monsters[fighting].health;
    healthBarColor(monsterCurrentHealth, monsterPercent);
}
function playerProgress(hp) {
    const heroHp = document.querySelector(".hero-hp");
    const playerCurrentHealth = document.querySelector(".hero-progress");
    let playerPercent;
    if(hp > 0)
        playerPercent = (hp / maxHealth) * 100;
    else
        playerPercent = 1;
    playerCurrentHealth.style.width = playerPercent + "%";
    heroHp.innerText = (hp > 0 ? hp : 0) + " / " + maxHealth;
    healthBarColor(playerCurrentHealth, playerPercent);
}
function healthBarColor(name, percent) {
    let color = "#44cc44";
    if (percent < 50 && percent > 25) {
        color = "#cccc44";
    } else if (percent <= 25) {
        color = "#cc4444";
    }
    name.style.backgroundColor = color;
}
function attack(skill) {
    skill = Number(skill);
    console.log(typeof skill);
    if (isMonsterHit()) {
        if(energy >= heroSkills[skill].energyCost) {
            dialog.innerText = "The " + monsters[fighting].name + " attacks. ";
            dialog.innerText += " You used your skill " + heroSkills[skill].name + ". ";

            const skillAttack = document.querySelector("." + heroSkills[skill].skillClass);
            if(skillAttack != null) {
                skillAttack.style.display = "block";
                setTimeout(() => {
                    skillAttack.style.display = "none";
                }, 700);
            }
            let monsterhitAmount = weapons[currentWeapon].power + Math.floor(Math.random() * (heroSkills[skill].power / 100 * heros[currentHero].attackPower)) + level;
            useEnergy(heroSkills[skill].energyCost);

            monsterHealth -= monsterhitAmount;
            monsterDamageText.style.display = "block";
            monsterDamageText.innerText = monsterhitAmount;

            let heroHitAmount = getMonsterAttackValue(monsters[fighting].level);
            health -= heroHitAmount;
            heroDamageText.style.display = "block";
            heroDamageText.innerText = heroHitAmount;
        } else {
            dialog.innerText += "Insufficent Energy.";
        }
    } else {
        dialog.innerText += " You miss.";
    }
    playerProgress(health);
    monsterProgress(monsterHealth);
    if (health <= 0) {
        setTimeout(() => {
            lose();
        }, 500);
    } else if (monsterHealth <= 0) {
        if (fighting === 3) {
            setTimeout(() => {
                winGame();
            }, 500);
        } else {
            setTimeout(() => {
                defeatMonster();
            }, 1000);
        }
    }
    if(currentWeapon < 3) {
        playWeaponAudio();
    } else {
        playSwordAudio();
    }
    setTimeout(() => {
        heroDamageText.style.display = "none";
        monsterDamageText.style.display = "none";
    }, 500);
}
function getMonsterAttackValue(level) {
    const hit = Math.floor(Math.abs((level * 3) - (Math.floor(Math.random() * (level * 10)) / 10)));
    return hit > 0 ? hit : 0;
}

function isMonsterHit() {
    return Math.random() > .05;
}

function defeatMonster() {
    const prevGold = gold;
    const prevXp = xp;
    gold += Math.floor(Math.random() * monsters[fighting].level * 5);
    xp += Math.floor(Math.random() * monsters[fighting].level * 10);
    animateNumber(goldText, prevGold, gold);
    iconsPulse("coinIcon");
    animateNumber(xpText, prevXp, xp);
    iconsPulse("xpIcon");
    updateLevel();
    update(locations[3]);
    saveGame();
}
function updateLevel() {
    const xpProgressBar = document.querySelector(".xp-progress-bar");
    const levelXp = [0, 30, 80, 180, 300, 450, 900, 1250, 1500, 1800];
    for (let i = 1; i < levelXp.length - 1; i++) {
        if (xp > 2000) {
            level = 10;
            break;
        } else if (xp > levelXp[i] && xp < levelXp[i + 1]) {
            level = i + 1;
        } else if (xp == 0) {
            level = 1;
        }
    }
    let xpForNextLevel = levelXp[level] - levelXp[level - 1];
    let currentXpInLevel = xp - levelXp[level - 1];
    let xpPercent = (currentXpInLevel / xpForNextLevel) * 100;
    xpProgressBar.style.width = xpPercent + "%";
    levelText.innerText = level;
    heroLevelText.innerText = level;
    saveGame();
}
function gameOverPop(result) {
    const gameOverPopup = document.querySelector(".game-over-cover");
    const gameOverText = document.querySelector(".game-over");
    if(result == "win") {
        gameOverPopup.style.display = "flex";
        gameOverText.innerHTML = "&#x1F389 You Won &#x1F389";
    } else {
        gameOverPopup.style.display = "flex";
        gameOverText.innerHTML = "You die. &#x2620;";
    }
}
function lose() {
    restart();
    update(locations[4]);
    playLoseAudio();
}

function winGame() {
    restart();
    update(locations[5]);
    playWinAudio();
}

function restart() {
    localStorage.removeItem(SAVE_KEY);
}
function reload() {
    setTimeout(() => {
        location.reload();
    }, 300);
}

/* Lucky Block Start*/
let currentDot = 0;
let rarity = 0;
let rarities = [
    "var(--common)",
    "var(--rare)",
    "var(--epic)",
    "var(--legendary)",
    "var(--mythic)"
]

let luckyGameTouch = document.querySelector(".lucky-game-cover");
luckyGameTouch.addEventListener('click', luckyBlock);
let luckRate = 0.5;

function luckyBlock() {
    let gameBg = document.querySelector(".lucky-game");
    const dots = document.querySelectorAll(".dot");
    const openText = document.querySelector(".open-text");
    playLidAnimation();
    if (currentDot < dots.length) {
        let luck = Math.random() < luckRate;
        luckRate -= 0.1;
        if (luck) {
            rarity++;
        }
        dots[currentDot].classList.add("dot-used");
        currentDot++;
        if (rarity > 0 && rarity <= 4) {
            gameBg.style.backgroundColor = rarities[rarity];
        }
    } else if (currentDot == dots.length) {
        luckResult(rarity);
        rarity = 0;
        currentDot = 0;
        luckRate = 0.5;
        openText.style.display = "none";
        gameBg.style.backgroundColor = rarities[0];
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove("dot-used");
        }
    }
    if (currentDot == dots.length) {
        openText.style.display = "block";
    }
}

function luckResult(rarity) {
    const popup = document.querySelector(".result");
    const text = document.querySelector(".result-text");
    const okBtn = document.querySelector(".ok");
    const rarityNames = ["stick", "dagger", "hammer", "iron sword", "diamond sword"];
    const rarityName = rarityNames[rarity];
    text.textContent = "You got: " + rarityName;
    addWeapon(rarityName);
    popup.style.display = "flex";
    okBtn.onclick = function () {
        gameLucky.style.display = "none";
        gameHero.style.display = "flex";
        popup.style.display = "none";
    }
}
/* Lucky Block End*/

/* Animations and Visuals */
document.querySelectorAll('.bar-buttons, .page-item, .shop-page-item, .skills')
.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.add('bounce-animation');
        setTimeout(() => {
            btn.classList.remove('bounce-animation');
        }, 400);
    });
});
document.querySelectorAll(".main-button")
.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.add('bounce-transform');
        setTimeout(() => {
            btn.classList.remove('bounce-transform');
        }, 400);
    });
});

function iconsPulse(iconName) {
    const xpIcon = document.querySelector(".xp-icon");
    const coinIcon = document.querySelector(".coin-icon");
    const healthIcon = document.querySelector(".health-icon");

    let icon;
    if(iconName === "coinIcon") {
        icon = coinIcon;
    } else if(iconName === "healthIcon") {
        icon = healthIcon;
    } else {
        icon = xpIcon;
    }
    icon.style.animation = "pulse 0.4s ease-in-out";
    setTimeout(() => {
        icon.style.animation = "none";
    }, 300);
}
document.querySelectorAll(".game-element-icon").forEach(icon => {
    icon.addEventListener('click', () => {
        icon.style.animation = "bounce 0.3s ease";
        setTimeout(() => {
            icon.style.animation = "none";
        }, 400);
    });
});

function animateNumber(textElement, start, end) {
    // to animate and also to update text
	let startTime = null;
    const duration = 400;
	function tick(time) {
		if (!startTime) startTime = time;
		const progress = Math.min((time - startTime) / duration, 1);
		textElement.innerText = Math.floor(start + (end - start) * progress);
		if (progress < 1) requestAnimationFrame(tick);
	}
    saveGame();
	requestAnimationFrame(tick);
}

//audio
document.querySelectorAll('.bar-buttons, .nav-button, .main-button')
.forEach(btn => {
    const buttonAudio = document.getElementById('button-sound');
    buttonAudio.currentTime = 0;
    btn.addEventListener('click', () => {
        buttonAudio.play();
    });
});

function playWinAudio() {
    const winAudio = document.getElementById('win-sound');
    winAudio.currentTime = 0;
    winAudio.play();
}
function playLoseAudio() {
    const loseAudio = document.getElementById('lose-sound');
    loseAudio.currentTime = 0;
    loseAudio.play();
}

function playTeleportAudio() {
    const teleportAudio = document.getElementById('teleport-sound');
    teleportAudio.currentTime = 0;
    teleportAudio.volume = 0.3;
    teleportAudio.play();
}

function playBuySuccessAudio() {
    const buySuccessAudio = document.getElementById("buy-success-sound");
    buySuccessAudio.currentTime = 0;
    buySuccessAudio.play();
}
function playBuyFailAudio() {
    const buyFailAudio = document.getElementById("buy-fail-sound");
    buyFailAudio.currentTime = 0;
    buyFailAudio.play();
}

function playWeaponAudio() {
    const weaponAudio = document.getElementById('weapon-sound');
    weaponAudio.currentTime = 0;
    weaponAudio.play();
}
function playSwordAudio() {
    const swordAudio = document.getElementById('sword-sound');
    swordAudio.currentTime = 0;
    swordAudio.play();
}

// Ad setup
const adBox = document.querySelector(".ad-box");
const adPop = document.querySelector(".ad-pop");
const xMark = document.querySelector(".closeAd");

adBox.addEventListener('click', showAd);
xMark.addEventListener('click', () => {
    console.log("Ad closed");
    adPop.style.display = "none";
    gainGold(5);
});

let adLoaded = false;
function showAd() {
    adPop.style.display = "flex";
    if (!adLoaded) {
        requestAnimationFrame(() => {
            (adsbygoogle = window.adsbygoogle || []).push({});
            adLoaded = true;
        });
    }
}

// mouse follow effect
const cursorDot = document.querySelector(".cursor-dot");
window.addEventListener('mousemove', (e) => {
    cursorDot.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
});
const hoverTargets = document.querySelectorAll(
    ".button, .nav-button, .bar-buttons, .game-element-icon, .shop-page-item, .closeAd, .page-item, .skills"
);

hoverTargets.forEach(el => {
    el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
    });

    el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
    });
});
