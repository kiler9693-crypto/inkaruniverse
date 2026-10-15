const space = document.getElementById("space");

//звёзды и рандом 
for (let i = 0; i < 150; i++) {
    const star = document.createElement("div");

    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";

    space.appendChild(star);
}

// это мои (сообщения тебе) кометки 
function createComet(){
    const comet = document.createElement("div");
    comet.className = "comet";

    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight * 0.6;

    const angle = (Math.random() * 100 + 20) * Math.PI / 180;
    const distance = 250 + Math.random() * 350;

    const endX = startX + Math.cos(angle) * distance;
    const endY = startY + Math.sin(angle) * distance;

    comet.style.left = startX + "px";
    comet.style.top = startY + "px";

    comet.style.setProperty(
        "--angle",
        (angle * 180 / Math.PI) + "deg"
    );

    space.appendChild(comet);

    const animation = comet.animate(
        [
            {
                transform: "translate(0, 0) scale(0.6)",
                opacity: 0
            },
            {
                transform: "translate(0, 0) scale(1)",
                opacity: 1,
                offset: 0.15
            },
            {
                transform:
                    `translate(${endX - startX}px, ${endY - startY}px) scale(0.4)`,
                opacity: 0
            }
        ],
        {
            duration: 700 + Math.random() * 700,
            easing: "linear"
        }
    );

    animation.onfinish = () => comet.remove();
}

// появления кометы каждые 2,5 секунды
setInterval(createComet, 2500);

let planetStarted = false;

function startPlanet() {
    if (planetStarted) return;

    const planetBox = document.getElementById("planet");

    if (!planetBox || !window.THREE) {
        console.error("Не загрузилась библиотека Three.js");
        return;
    }

    planetStarted = true;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    // Отдельное вращение всей системы
    let systemDragging = false;
    let systemLastX = 0;
    let systemLastY = 0;
    let systemRotationX = 0;
    let systemRotationY = 0;

    const camera = new THREE.PerspectiveCamera(
        45,
        planetBox.clientWidth / planetBox.clientHeight,
        0.1,
        100
    );
    camera.position.z = 8.2;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(planetBox.clientWidth, planetBox.clientHeight);
    planetBox.appendChild(renderer.domElement);

    // Свет в космосе
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const sunlight = new THREE.DirectionalLight(0xffffff, 3);
    sunlight.position.set(4, 3, 5);
    scene.add(sunlight);

    
    // Текстурки земли 
    const loader = new THREE.TextureLoader();

    const earthTexture = loader.load(
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
    );

    const earthNormal = loader.load(
        "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"
    );

    const earthSpecular = loader.load(
        "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
    );

    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(1.55, 96, 96),
        new THREE.MeshPhongMaterial({
            map: earthTexture,
            normalMap: earthNormal,
            specularMap: earthSpecular,
            specular: new THREE.Color(0x555555),
            shininess: 18
        })
    );

    scene.add(planet);


    // Отдельный слой облаков
    const cloudTexture = loader.load(
        "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
    );

    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.575, 96, 96),
        new THREE.MeshPhongMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.32,
            depthWrite: false
        })
    );

    planet.add(clouds);


    // Мягкое светящееся голубое обрамление
    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.62, 64, 64),
        new THREE.MeshBasicMaterial({
            color: 0x4ebdff,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide
        })
    );

    planet.add(atmosphere);
    
   
        //ФОНОВЫЕ ПЛАНЕТЫ И СОЛНЦ

    const spaceLoader = new THREE.TextureLoader();

    // планета с запас цветом
    function createBackgroundPlanet(size, color, textureUrl, x, y, z) {
       const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 8,
    specular: new THREE.Color(0x222222)
    });

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(size, 48, 48),
            material
        );

        sphere.position.set(x, y, z);
        scene.add(sphere);

        if (textureUrl) {
            spaceLoader.load(
                textureUrl,
                texture => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    material.map = texture;
                    material.color.set(0xffffff);
                    material.needsUpdate = true;
                },
                undefined,
                () => {
                    console.warn("Текстура не загрузилась, оставляем цвет:", color);
                }
            );
        }

        return sphere;
    }

    // СОЛНЦЕ
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-3.6, 1.5, -4.5);
    scene.add(sunGroup);

    const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 48, 48),
    new THREE.MeshBasicMaterial({
        color: 0xffa51f,
        toneMapped: false
    })
    );
    sunGroup.add(sun);

    // Мягкое свечения солнца
const glowCanvas = document.createElement("canvas");
glowCanvas.width = 256;
glowCanvas.height = 256;

const glowContext = glowCanvas.getContext("2d");

const glowGradient = glowContext.createRadialGradient(
    128, 128, 5,
    128, 128, 128
);

glowGradient.addColorStop(0, "rgba(255, 255, 210, 1)");
glowGradient.addColorStop(0.12, "rgba(255, 190, 70, 0.85)");
glowGradient.addColorStop(0.35, "rgba(255, 130, 30, 0.35)");
glowGradient.addColorStop(0.65, "rgba(255, 90, 20, 0.10)");
glowGradient.addColorStop(1, "rgba(255, 70, 0, 0)");

glowContext.fillStyle = glowGradient;
glowContext.fillRect(0, 0, 256, 256);

const glowTexture = new THREE.CanvasTexture(glowCanvas);

const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffa52a,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })
);

sunGlow.scale.set(2.2, 2.2, 1);
sunGroup.add(sunGlow);

    const sunLight = new THREE.PointLight(0xffc477, 8, 25);
    sunLight.position.copy(sunGroup.position);
    scene.add(sunLight);

    // МЕРКУРИЙ
    const mercury = createBackgroundPlanet(
        0.13, 0xaaa49c,
        "./textures/2k_mercury.jpg",
        -2.75, 0.45, -3.5
    );

    // ВЕНЕРА
    const venus = createBackgroundPlanet(
        0.19, 0xe8b879,
        "./textures/2k_venus_surface.jpg",
        -2.15, -0.35, -3.8
    );

    // МАРС
    const mars = createBackgroundPlanet(
        0.22, 0xd95b35,
        "./textures/2k_mars.jpg",
        2.0, 1.05, -3.5
    );

    // ЮПИТЕР
    const jupiter = createBackgroundPlanet(
        0.38, 0xd8b18a,
        "./textures/2k_jupiter.jpg",
        3.0, 0.25, -4.5
    );

    // САТУРН И КОЛЬЦА
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(3.15, -1.0, -4.8);
    saturnGroup.rotation.z = -0.25;
    scene.add(saturnGroup);

    const saturnMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9bd8c,
        roughness: 1
    });

    const saturn = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 48, 48),
        saturnMaterial
    );
    saturnGroup.add(saturn);

    spaceLoader.load(
        "./textures/2k_saturn.jpg",
        texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            saturnMaterial.map = texture;
            saturnMaterial.color.set(0xffffff);
            saturnMaterial.needsUpdate = true;
        },
        undefined,
        () => console.warn("Текстура Сатурна не загрузилась")
    );

    const saturnRings = new THREE.Mesh(
        new THREE.RingGeometry(0.43, 0.72, 96),
        new THREE.MeshBasicMaterial({
            color: 0xcbb58e,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        })
    );

    saturnRings.rotation.x = Math.PI / 2.5;
    saturnGroup.add(saturnRings);

    // УРАН
    const uranus = createBackgroundPlanet(
        0.24, 0x76d9e5,
        "./textures/2k_uranus.jpg",
        -2.5, -1.4, -4.5
    );

    // НЕПТУН
    const neptune = createBackgroundPlanet(
        0.25, 0x4169e1,
        "./textures/2k_neptune.jpg",
        2.2, -1.65, -5
    );

    // Медленное вращение фоновых планет.
    // землю не брал здесь 
    function animateBackgroundPlanets() {
        mercury.rotation.y += 0.002;
        venus.rotation.y += 0.001;
        mars.rotation.y += 0.0015;
        jupiter.rotation.y += 0.001;
        saturn.rotation.y += 0.0015;
        uranus.rotation.y += 0.001;
        neptune.rotation.y += 0.001;

        requestAnimationFrame(animateBackgroundPlanets);
    }

    animateBackgroundPlanets();


// ВЫБОР ПЛАНЕТ И ПЛАВНЫЕ ПЕРЕХОДЫ В МОЕ СЕРДЦЕ

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let pointerStartX = 0;
let pointerStartY = 0;
let dragging = false;
let traveling = false;

// Свободная камера
let freeCameraMode = false;
let freeLookDragging = false;

const pressedKeys = new Set();

let cameraYaw = 0;
let cameraPitch = 0;

const cameraMoveSpeed = 4;
const cameraLookSpeed = 0.004;

// Управление клавиатурой
window.addEventListener("keydown", event => {
    if (freeCameraMode && [
        "KeyW", "KeyA", "KeyS", "KeyD",
        "Space", "ShiftLeft", "ShiftRight"
    ].includes(event.code)) {
        event.preventDefault();
    }

    if (event.code === "KeyF" && !event.repeat) {
        freeCameraMode = !freeCameraMode;
        pressedKeys.clear();

        if (freeCameraMode) {
            camera.rotation.order = "YXZ";
            cameraYaw = camera.rotation.y;
            cameraPitch = camera.rotation.x;
            console.log("Свободная камера включена");
        } else {
            freeLookDragging = false;
            console.log("Свободная камера выключена");
        }
    }

    pressedKeys.add(event.code);
});

window.addEventListener("keyup", event => {
    pressedKeys.delete(event.code);
});

window.addEventListener("blur", () => {
    pressedKeys.clear();
    freeLookDragging = false;
});

const earthHome = new THREE.Vector3(0, 0, 8.2);
const earthTarget = new THREE.Vector3(0, 0, 0);

//  дада я умница 
//  хехехехе.
const selectableBodies = [
    { name: "Солнце", hit: sun, focus: sunGroup, distance: 2.5 },
    { name: "Меркурий", hit: mercury, focus: mercury, distance: 1.3 },
    { name: "Венера", hit: venus, focus: venus, distance: 1.5 },
    { name: "Земля", hit: planet, focus: planet, distance: 8.2 },
    { name: "Марс", hit: mars, focus: mars, distance: 1.5 },
    { name: "Юпитер", hit: jupiter, focus: jupiter, distance: 2.2 },
    { name: "Сатурн", hit: saturn, focus: saturnGroup, distance: 2.2 },
    { name: "Уран", hit: uranus, focus: uranus, distance: 1.6 },
    { name: "Нептун", hit: neptune, focus: neptune, distance: 1.6 }
];

const messagePoints = [];

const messagePointGeometry = new THREE.SphereGeometry(0.045, 12, 12);

const messagePointMaterial = new THREE.MeshBasicMaterial({
    color: 0xffa5e8,
    toneMapped: false
});

selectableBodies.forEach((body) => {
    const count = Math.random() < 0.5 ? 2 : 3;

    
    const geometry = body.hit.geometry;
    const radius = geometry.parameters?.radius;

    
    if (!radius) {
        console.warn("Не удалось определить радиус:", body.name);
        return;
    }

    for (let i = 0; i < count; i++) {
        const point = new THREE.Mesh(
         messagePointGeometry,
         messagePointMaterial.clone()
        );
        point.visible = false;

        const y = Math.random() * 2 - 1;
        const angle = Math.random() * Math.PI * 2;
        const horizontal = Math.sqrt(1 - y * y);
        const distance = radius + 0.025;

        point.position.set(
            horizontal * Math.cos(angle) * distance,
            y * distance,
            horizontal * Math.sin(angle) * distance
        );

        point.userData.bodyName = body.name;
        point.userData.messageNumber = i + 1;

        body.hit.add(point);
        messagePoints.push(point);
    }
});

console.log("Создано точек:", messagePoints.length);


// Кнопка возврата к предыдущей планете 
const previousPlanetButton = document.createElement("button");
previousPlanetButton.id = "previousPlanetButton";
previousPlanetButton.textContent = "← Предыдущая планета";
previousPlanetButton.style.display = "none";
document.body.appendChild(previousPlanetButton);

function updatePreviousPlanetButton() {
    previousPlanetButton.style.display =
        planetHistory.length > 0 ? "block" : "none";
}

previousPlanetButton.addEventListener("click", () => {
    if (traveling || planetHistory.length === 0) return;

    const previousBody = planetHistory.pop();
    flyToBody(previousBody, true);
});
  


let currentBody = null;
let currentLookTarget = new THREE.Vector3(0, 0, 0);
const planetHistory = [];
currentBody = selectableBodies.find(
    body => body.name === "Земля"
);
// Показ точек только на выб планете
messagePoints.forEach(point => {
    point.visible = point.userData.bodyName === currentBody.name;
});
const planetMessages = {
    "Земля": {
        1: {
            title: "моя маленькая вселенная 🌍",
            text: "милая, ❤️ среди миллиардов звёзд я рад, что в моей жизни есть именно ты. ты стала особенной частью моего маленького мира."
        },
        2: {
            title: "твоя улыбка ✨",
            text: "знаешь, иногда достаточно просто увидеть твою улыбку, чтобы настроение стало лучше. надеюсь, у меня тоже получается заставлять тебя улыбаться."
        },
        3: {
            title: "маленькое признание 💗",
            text: "если бы мне предложили сохранить один момент из множества наших воспоминаний, я бы долго выбирал. потому что даже самые обычные моменты с тобой становятся дорогими."
        }
    },

    "Солнце": {
        1: {
            title: "моё солнышко ☀️",
            text: "ты умеешь приносить тепло даже в самые обычные дни. пусть у тебя всегда будет много причин улыбаться."
        },
        2: {
            title: "немного тепла 💛",
            text: "если сегодня тебе не хватает хорошего настроения, пусть это маленькое послание напомнит, что ты очень важна."
        },
        3: {
            title: "ты сияешь ✨",
            text: "у каждой звезды свой свет. и мне нравится именно твой — такой, который невозможно перепутать с другим."
        }
    },

    "Меркурий": {
        1: {
            title: "наша переписка 💌",
            text: "иногда обычное сообщение может сделать весь день лучше. особенно когда его ждёшь от определённого человека."
        },
        2: {
            title: "маленькие моменты 🫶",
            text: "мне нравятся даже самые простые разговоры с тобой. не обязательно обсуждать что-то важное, чтобы мне было приятно."
        },
        3: {
            title: "ещё одно сообщение 💗",
            text: "вот ты открыла ещё одну точку во вселенной, а там снова я напоминаю тебе, что ты особенная."
        }
    },

    "Венера": {
        1: {
            title: "ты прекрасна 🌷",
            text: "мне нравится, что ты остаёшься собой. твои привычки, твои мысли и твой характер делают тебя именно тобой."
        },
        2: {
            title: "твой характер 💕",
            text: "в каждом человеке есть что-то своё. в тебе есть много мелочей, которые хочется узнавать постепенно."
        },
        3: {
            title: "для тебя 🌸",
            text: "пусть ты почаще замечаешь, сколько в тебе хорошего. ты заслуживаешь добрых слов не только по особенным поводам."
        }
    },

    "Марс": {
        1: {
            title: "через галактики 🚀",
            text: "даже если нас разделяют расстояния, всегда можно поделиться новостями, мыслями и тем, что произошло за день."
        },
        2: {
            title: "я рядом ❤️",
            text: "если день выдался тяжёлым, не обязательно всегда быть сильной и весёлой. иногда можно просто выдохнуть и отдохнуть."
        },
        3: {
            title: "наше приключение 🌌",
            text: "впереди ещё столько новых историй, смешных моментов и мест, о которых можно будет вспоминать с улыбкой."
        }
    },

    "Юпитер": {
        1: {
            title: "ты делаешь день лучше ✨",
            text: "бывает, что настроение меняется от одного разговора. и иногда такой разговор — именно с тобой."
        },
        2: {
            title: "улыбнись 😊",
            text: "маленькое задание для тебя: улыбнись хотя бы на секунду. всё, задание выполнено, награда — это послание."
        },
        3: {
            title: "большое сердце 💗",
            text: "даже огромная планета не может вместить все слова, которые можно сказать хорошему человеку. поэтому начну с простого: ты мне дорога."
        }
    },

    "Сатурн": {
        1: {
            title: "ты особенная 🪐",
            text: "у сатурна есть кольца, у неба — звёзды, а у этой вселенной есть ты. у каждого свой неповторимый мир."
        },
        2: {
            title: "маленькое чудо 💫",
            text: "иногда самое красивое находится не где-то далеко, а в простых вещах: в добрых словах, заботе и искренней улыбке."
        },
        3: {
            title: "ещё одна звезда 🌟",
            text: "пусть эта точка напоминает тебе о хорошем. впереди ещё много моментов, которые могут стать любимыми воспоминаниями."
        }
    },

    "Уран": {
        1: {
            title: "наш маленький мир 💙",
            text: "у каждого есть свой маленький мир из любимых песен, воспоминаний и людей. я рад, что могу делиться с тобой частичкой своего."
        },
        2: {
            title: "секретная точка 🤫",
            text: "поздравляю, ты нашла ещё одно секретное послание! вселенная большая, но ты умудрилась найти даже это."
        },
        3: {
            title: "пусть будет хорошо 🫶",
            text: "желаю тебе побольше спокойных дней, приятных неожиданностей и людей, рядом с которыми можно быть собой."
        }
    },

    "Нептун": {
        1: {
            title: "без конца 💙",
            text: "космос кажется бесконечным, и всё же в нём есть место для маленьких, но важных историй. пусть наша тоже пополняется хорошими моментами."
        },
        2: {
            title: "глубина океана 🌊",
            text: "как у океана есть свои тайны, так и у каждого человека есть целый мир внутри. мне интересно узнавать твой постепенно."
        },
        3: {
            title: "последняя звезда? 🌠",
            text: "ты дошла до этой точки, но это не конец вселенной. впереди ещё столько всего, что можно открыть и придумать."
        }
    }
};


function showPlanetMessage(planetName, messageNumber) {
    const messages = planetMessages[planetName];
    const message = messages?.[messageNumber];
    if (!message) return;

    let card = document.getElementById("planetMessage");

    if (!card) {
        card = document.createElement("div");
        card.id = "planetMessage";

        card.innerHTML = `
            <button id="closePlanetMessage" aria-label="Закрыть">×</button>
            <div class="message-stars">✦　✧　♥</div>
            <h2 id="planetMessageTitle"></h2>
            <p id="planetMessageText"></p>
            <div class="message-bottom">с любовью, для тебя ❤️</div>
        `;

        document.body.appendChild(card);

        document.getElementById("closePlanetMessage")
            .addEventListener("click", () => {
                card.classList.remove("message-visible");
            });
    }

    document.getElementById("planetMessageTitle").textContent =
        message.title;

    document.getElementById("planetMessageText").textContent =
        message.text;

    card.classList.remove("message-visible");

    requestAnimationFrame(() => {
        card.classList.add("message-visible");
    });
}

function flyToBody(body, isBack = false) {
    if (traveling) return;
    if (currentBody === body) return;

    if (!isBack && currentBody) {
        planetHistory.push(currentBody);
    }

    traveling = true;

    const targetPosition = new THREE.Vector3();
    body.focus.getWorldPosition(targetPosition);

    const startPosition = camera.position.clone();
    const startTarget = currentLookTarget.clone();

    const endPosition = targetPosition.clone();
    endPosition.z += body.distance;

    const endTarget = targetPosition.clone();

    const duration = 1500;
    const startTime = performance.now();

    function animateFlight(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = progress * progress * (3 - 2 * progress);

        camera.position.lerpVectors(
            startPosition,
            endPosition,
            eased
        );

        const currentTarget = new THREE.Vector3().lerpVectors(
            startTarget,
            endTarget,
            eased
        );

        camera.lookAt(currentTarget);

        if (progress < 1) {
            requestAnimationFrame(animateFlight);
        } else {
            camera.position.copy(endPosition);
            camera.lookAt(endTarget);

            traveling = false;
            currentBody = body;

            messagePoints.forEach(point => {
                point.visible =
                    point.userData.bodyName === body.name;
            });

            currentLookTarget.copy(endTarget);
            updatePreviousPlanetButton();

            console.log("Ты прилетела на планету:", body.name);
        }
    }

    requestAnimationFrame(animateFlight);
}


renderer.domElement.addEventListener("contextmenu", event => {
    event.preventDefault();
});

renderer.domElement.addEventListener("pointerdown", event => {
    if (traveling) return;

   
if (event.button === 2) {
    if (freeCameraMode) {
        freeLookDragging = true;
        cameraYaw = camera.rotation.y;
        cameraPitch = camera.rotation.x;
    } else {
        systemDragging = true;
        systemLastX = event.clientX;
        systemLastY = event.clientY;
    }

    renderer.domElement.setPointerCapture(event.pointerId);
    return;
}


    if (event.button !== 0) return;

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    dragging = false;

    renderer.domElement.setPointerCapture(event.pointerId);
});


renderer.domElement.addEventListener("pointermove", event => {
    // Осмотр свободной камерой
    if (freeLookDragging && freeCameraMode) {
        cameraYaw -= event.movementX * cameraLookSpeed;
        cameraPitch -= event.movementY * cameraLookSpeed;

        cameraPitch = Math.max(
            -Math.PI / 2 + 0.01,
            Math.min(Math.PI / 2 - 0.01, cameraPitch)
        );

        camera.rotation.order = "YXZ";
        camera.rotation.y = cameraYaw;
        camera.rotation.x = cameraPitch;
        return;
    }

    // Вращение галактики в обычн режиме
    if (systemDragging) {
        const dx = event.clientX - systemLastX;
        const dy = event.clientY - systemLastY;

        systemRotationY += dx * 0.005;
        systemRotationX += dy * 0.005;

        systemLastX = event.clientX;
        systemLastY = event.clientY;
        return;
    }

    if (!renderer.domElement.hasPointerCapture(event.pointerId)) return;

    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        dragging = true;
    }

    if (dragging && currentBody) {
        currentBody.hit.rotation.y += event.movementX * 0.005;
        currentBody.hit.rotation.x += event.movementY * 0.005;
    }
});



renderer.domElement.addEventListener("pointerup", event => {
   if (event.button === 2) {
     systemDragging = false;
     freeLookDragging = false;
     return;
    }

    if (dragging || traveling) {
        dragging = false;
        return;
    }

    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Проверкааааа точки с посланиями
    const pointHits = raycaster.intersectObjects(messagePoints, false);

    console.log("Найдено точек:", pointHits.length);

    if (pointHits.length > 0 && currentBody) {
        const point = pointHits[0].object;

        if (point.userData.bodyName === currentBody.name) {
            showPlanetMessage(
                point.userData.bodyName,
                point.userData.messageNumber
            );
            dragging = false;
            return;
        }
    }

    // Проверка епта планеты
    const hits = raycaster.intersectObjects(
        selectableBodies.map(body => body.hit),
        false
    );

    console.log("Найдено планет:", hits.length);

    if (hits.length > 0) {
        const selected = selectableBodies.find(
            body => body.hit === hits[0].object
        );

        if (selected && selected !== currentBody) {
            console.log("Перелёт на:", selected.name);
            flyToBody(selected);
        }
    }

    dragging = false;
});



renderer.domElement.addEventListener("pointercancel", () => {
    dragging = false;
});
    
    // это типо размер под окно подгоняем 
    function resizePlanet() {
        const width = planetBox.clientWidth;
        const height = planetBox.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener("resize", resizePlanet);

    // Запуск якобы анимации
    
        

let previousFrameTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - previousFrameTime) / 1000, 0.05);
    previousFrameTime = now;

    // Вращение галактики в обыч режиме
    if (!freeCameraMode) {
        scene.rotation.y = systemRotationY;
        scene.rotation.x = systemRotationX;
    }

    // Свободное перемещение чамеры
    if (freeCameraMode && !traveling) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);

        const right = new THREE.Vector3()
            .crossVectors(forward, camera.up)
            .negate()
            .normalize();

        const speed = cameraMoveSpeed * delta;

        if (pressedKeys.has("KeyW")) {
            camera.position.addScaledVector(forward, speed);
        }
        if (pressedKeys.has("KeyS")) {
            camera.position.addScaledVector(forward, -speed);
        }
        if (pressedKeys.has("KeyA")) {
            camera.position.addScaledVector(right, speed);
        }
        if (pressedKeys.has("KeyD")) {
            camera.position.addScaledVector(right, -speed);
        }
        if (pressedKeys.has("Space")) {
            camera.position.y += speed;
        }
        if (
            pressedKeys.has("ShiftLeft") ||
            pressedKeys.has("ShiftRight")
        ) {
            camera.position.y -= speed;
        }
    }

    renderer.render(scene, camera);
}

animate();

}


// эт запуск планеты при открытие второй страницы иееее
document.getElementById("openUniverse").addEventListener("click", () => {
    requestAnimationFrame(startPlanet);
});
