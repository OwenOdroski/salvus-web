// Setup THREE.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#canvas"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const loader = new THREE.GLTFLoader()
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;

const light = new THREE.AmbientLight(0xFFFFFF, 1.4)
scene.add(light)

// Load model of F-16
loader.load("f16.glb", function(gltf) {
  scene.add(gltf.scene)
  gltf.scene.children[0].children[0].children[0].children[5].visible = false
})

// Opening alerts
function openText(name, desc) {
  document.getElementById('alert').style.display = 'flex'
  document.getElementById('blurback').style.display = 'block'
  document.getElementById('alert-name').textContent = name
  document.getElementById('alert-desc').innerHTML = desc
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}
animate()

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// References
function openRef() {
  document.getElementById('ref').style.display = 'block'
}
function openSys() {
  document.getElementById('top').style.display = 'block'
}
function open3D() {
  document.getElementById('3Dtool').style.display = 'block'
  camera.position.set(100, 40, 70)
  camera.lookAt(0, 0, 0)
}

// Torque Converter
function newTorque(originalTorque, angleDeg, extenderLength, wrenchLength = 10) {
  const angleRad = angleDeg * Math.PI / 180;
  return originalTorque * ((wrenchLength + extenderLength * Math.cos(angleRad)) / wrenchLength);
}

function torqueSubmit() {
  let twLength = document.getElementById('torque-input1')
  let exLength = document.getElementById('torque-input2')
  let originTorque = document.getElementById('torque-input3')
  let degS = document.getElementById('torque-input4')
  let degA = [0, 45, 90, 135, 180, 225, 270, 315]
  let deg = degA[degS.selectedIndex]

  document.getElementById('torque-output').textContent = "New Torque: ~" + Math.round(newTorque(JSON.parse(originTorque.value), deg, JSON.parse(exLength.value), JSON.parse(twLength.value)))
}

function updateTorqueIn(deg) {
  let can = document.querySelector("#torque-canvas")
  let ctx = can.getContext('2d')

  let width = window.innerWidth
  let height = window.innerHeight

  can.width = width * 0.8
  can.height = height * 0.25

  if(can.width > 300) {
    can.width = 300
  }

  let w = (num) => {
    return (can.width * 1.5) * (num / 100)
  }
  let h = (num) => {
    return can.height * (num / 100)
  }

  ctx.strokeStyle = '#258c00'
  ctx.lineWidth = 3

  // Handle
  ctx.strokeRect(0, h(50) - (h(40) / 2), w(20), h(40))
  ctx.strokeRect(w(20), h(50) - (h(30) / 2), w(20), h(30))

  ctx.beginPath();
  ctx.arc(w(20) + (w(20)), h(50) - (h(30) / 2) + (h(30) / 2), h(15), 0, 2 * Math.PI);
  ctx.fillStyle = '#151b1f'
  ctx.fill();

  ctx.beginPath();
  ctx.arc(w(20) + (w(20)), h(50) - (h(30) / 2) + (h(30) / 2), h(15), 0, 2 * Math.PI);
  ctx.stroke();

  let axis = [
    w(20) + (w(15)) + (w(10) / 2),
    h(50) - (h(30) / 2) + (h(15))
  ]
  // save current canvas state
  ctx.save();

  // move origin to your axis
  ctx.translate(axis[0], axis[1]);

  // rotate by degrees (convert to radians)
  ctx.rotate(deg * Math.PI / 180);

  // draw the rect *relative to new origin*
  ctx.fillRect(-w(5), -h(10), w(25), h(20));
  ctx.strokeRect(-w(5), -h(10), w(25), h(20));

  ctx.beginPath();
  ctx.arc(w(15), 0, h(7), 0, 2 * Math.PI);
  ctx.stroke();

  // restore so further drawing is unaffected
  ctx.restore();
}

window.setTimeout(function() {
  updateTorqueIn(0)

  let select = document.getElementById('torque-input4')

  select.addEventListener('change', function() {
    let degA = [0, 45, 90, 135, 180, 225, 270, 315]
    let deg = degA[select.selectedIndex]
    updateTorqueIn(deg)
  })
}, 100)

// Fuel calculator
let maxLoads = [7200, 12200, 9200, 14000];

function submitFuel() {
  let total = document.getElementById('fuel-input')
  let selected = document.getElementById('config')
  let model = document.getElementById('model')
  let result1 = document.getElementById('fuel-output1')
  let result2 = document.getElementById('fuel-output2')


  let fullWeight = maxLoads[selected.selectedIndex]

  if(model.selectedIndex == 1) {
    fullWeight = fullWeight - 1250
  }

  result1.innerHTML = "JP-8: " + (Math.floor(((fullWeight - JSON.parse(total.value)) / 6.8) * 100) / 100) + " G"
  result2.innerHTML = "JP-4: " + (Math.floor(((fullWeight - JSON.parse(total.value)) / 6.4) * 100) / 100) + " G"
}

// Oil Consumption
function submitOil() {
  let data = document.getElementById('oil-input')
  let consumption = 1.5 * JSON.parse(data.value)

  document.getElementById('oil-output').textContent = 'MAX CONSUMPTION: ~' + Math.floor(consumption * 10) / 10 + ' hpt(s)'
}

// TO Lookup
const TO_DATABASE = [
  {
    number: "00XX-10-001",
    title: "General Maintenance Practices"
  },
  {
    number: "00XX-10-002",
    title: "Fastener Installation Standards"
  },
  {
    number: "00XX-10-003",
    title: "Electrical Connector Inspection"
  },
  {
    number: "00XX-20-001",
    title: "Hydraulic System Servicing"
  },
  {
    number: "00XX-20-002",
    title: "Hydraulic Leak Troubleshooting"
  },
  {
    number: "00XX-30-001",
    title: "Landing Gear Inspection"
  },
  {
    number: "00XX-30-002",
    title: "Wheel and Brake Maintenance"
  },
  {
    number: "00XX-40-001",
    title: "Fuel System Inspection"
  },
  {
    number: "00XX-40-002",
    title: "Fuel Quantity Verification"
  },
  {
    number: "00XX-50-001",
    title: "Engine Removal Procedures"
  },
  {
    number: "00XX-50-002",
    title: "Engine Installation Procedures"
  },
  {
    number: "00XX-60-001",
    title: "Flight Control Adjustment"
  },
  {
    number: "00XX-70-001",
    title: "Avionics Functional Checks"
  },
  {
    number: "00XX-70-002",
    title: "Communication System Testing"
  },
  {
    number: "00XX-80-001",
    title: "Exterior Surface Inspection"
  },
  {
    number: "00XX-90-001",
    title: "Corrosion Prevention Guide"
  }
];
function searchTO() {
    const search = document.getElementById("to-input").value.toLowerCase();
    const output = document.getElementById("to-output");

    output.innerHTML = "";

    TO_DATABASE
        .filter(to =>
            to.number.toLowerCase().includes(search) ||
            to.title.toLowerCase().includes(search)
        )
        .forEach(to => {
            output.innerHTML += `
                <div class="result">
                    <strong>${to.number}</strong><br>
                    ${to.title}
                </div>
            `;
        });

    if (output.innerHTML === "") {
        output.innerHTML = "No matching Technical Orders found.";
    }
}

document.getElementById("to-input").addEventListener("input", searchTO);
searchTO()

// WUC Lookup
const WUC_DATABASE = [
  { code: "1100A", name: "Primary Hydraulic Pump" },
  { code: "1100B", name: "Hydraulic Reservoir" },
  { code: "1200A", name: "Main Fuel Pump" },
  { code: "1200B", name: "Fuel Transfer Valve" },
  { code: "1300A", name: "Environmental Cooling Unit" },
  { code: "1400A", name: "Primary Electrical Bus" },
  { code: "1400B", name: "External Power Connector" },
  { code: "1500A", name: "Starter Assembly" },
  { code: "1600A", name: "Main Landing Gear Assembly" },
  { code: "1600B", name: "Nose Landing Gear Assembly" },
  { code: "1700A", name: "Brake Control Unit" },
  { code: "1800A", name: "Canopy Locking Mechanism" },
  { code: "1900A", name: "Flight Control Computer" },
  { code: "2000A", name: "Navigation Processor" },
  { code: "2100A", name: "Communication Transceiver" },
  { code: "2200A", name: "Radar Processing Unit" },
  { code: "2300A", name: "Oxygen Distribution Assembly" },
  { code: "2400A", name: "Engine Oil System" },
  { code: "2500A", name: "Air Intake Assembly" },
  { code: "2600A", name: "Exhaust Nozzle Assembly" }
];
function searchWUC() {
    const search = document.getElementById("wuc-input").value.toLowerCase();
    const output = document.getElementById("wuc-output");

    output.innerHTML = "";

    WUC_DATABASE
        .filter(wuc =>
            wuc.code.toLowerCase().includes(search) ||
            wuc.name.toLowerCase().includes(search)
        )
        .forEach(wuc => {
            output.innerHTML += `
                <div class="result">
                    <strong>${wuc.code}</strong><br>
                    ${wuc.name}
                </div>
            `;
        });

    if (output.innerHTML === "") {
        output.innerHTML = "No matching Work Unit Codes found.";
    }
}

document.getElementById("wuc-input").addEventListener("input", searchWUC);
searchWUC()

// Phone Number search
const PHONE_DATABASE = [
  {
    shop: "Maintenance Control",
    extension: "2101",
    phone: "(555) 210-1001"
  },
  {
    shop: "Production Supervision",
    extension: "2102",
    phone: "(555) 210-1002"
  },
  {
    shop: "Aircraft Inspection",
    extension: "2103",
    phone: "(555) 210-1003"
  },
  {
    shop: "Hydraulics",
    extension: "2110",
    phone: "(555) 210-1010"
  },
  {
    shop: "Electrical Systems",
    extension: "2111",
    phone: "(555) 210-1011"
  },
  {
    shop: "Avionics",
    extension: "2112",
    phone: "(555) 210-1012"
  },
  {
    shop: "Engine Shop",
    extension: "2120",
    phone: "(555) 210-1020"
  },
  {
    shop: "Sheet Metal",
    extension: "2121",
    phone: "(555) 210-1021"
  },
  {
    shop: "Fabrication",
    extension: "2122",
    phone: "(555) 210-1022"
  },
  {
    shop: "Support Equipment",
    extension: "2130",
    phone: "(555) 210-1030"
  },
  {
    shop: "Fuel Systems",
    extension: "2131",
    phone: "(555) 210-1031"
  },
  {
    shop: "Scheduling",
    extension: "2140",
    phone: "(555) 210-1040"
  },
  {
    shop: "Quality Assurance",
    extension: "2141",
    phone: "(555) 210-1041"
  },
  {
    shop: "Supply",
    extension: "2151",
    phone: "(555) 210-1051"
  }
];
function searchPhone() {
    const search = document.getElementById("phone-input").value.toLowerCase();
    const output = document.getElementById("phone-output");

    output.innerHTML = "";

    PHONE_DATABASE
        .filter(entry =>
            entry.shop.toLowerCase().includes(search) ||
            entry.extension.includes(search) ||
            entry.phone.includes(search)
        )
        .forEach(entry => {
            output.innerHTML += `
                <div class="result">
                    <strong>${entry.shop}</strong><br>
                    Ext: ${entry.extension}<br>
                    ${entry.phone}
                </div>
            `;
        });

    if (output.innerHTML === "") {
        output.innerHTML = "No matching phone numbers found.";
    }
}

document.getElementById("phone-input").addEventListener("input", searchPhone);
searchPhone()
