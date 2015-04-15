"use strict";

// Matter.js module aliases
var worldWidth = 1440;
var worldHeight = 778;

var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;
var Query = Matter.Query;
var Composite = Matter.Composite;
var Vector = Matter.Vector;

var isRunning = true;
var speedPanning = -3;
var rangeTerrain = {
    from: 50,
    to: 250
};

// create a Matter.js engine
var engine = Engine.create(document.body, {
    render: {
        options: {
            width: worldWidth,
            height: worldHeight,
            background: '/images/stars.jpg',
            wireframes: true
        }
    }
});

var world = engine.world;
world.bounds.max = {
    x: worldWidth,
    y: worldHeight
};

// references for terrain
var terrainBodies = [];
var missiles = [];
var laserShots = [];

var compositeTerrain = Composite.create();

// apply force to terrain bodies
var tickEvent = Events.on(engine, 'tick', function (event) {

    if(isRunning) {
        Composite.translate(compositeTerrain, { x: speedPanning, y: 0 });
    }

    var terrainBodies = Composite.allBodies(compositeTerrain);

    if(terrainBodies) {
        // Check if last is fully in viewport
        var terrainBody = null;
        if(terrainBodies.length > 0) {
            terrainBody = terrainBodies[terrainBodies.length - 1];
        } else {
            terrainBody = terrainBodies;
        }

        if(terrainBody.bounds) {
            if(worldWidth - 50 > terrainBody.bounds.min.x) {
                addTerrain();
            }
        }
    }

    var isTerreinHit = Query.region(terrainBodies, ship.bounds);
    var isMissileHit = Query.region(missiles, ship.bounds);

    laserShots.forEach(function(laser) {
        var isMissileHitByLaser = Query.region(missiles, laser.bounds);

        isMissileHitByLaser.forEach(function(missileToRemove) {
            World.remove(engine.world, missileToRemove);
        });
    });

    var posY = ship.position.y;
    var posX = ship.position.x;
    var isShipInViewport = posY >= worldHeight - 20 || posY <= 20 || posX <= 20 || posX >= worldWidth - 20;

    if((!!isTerreinHit.length || !!isMissileHit.length || isShipInViewport) && isRunning) {
        isMissileHit.forEach(function(missileToRemove) {
            World.remove(engine.world, missileToRemove);
        });

        ship.render.sprite.texture = '/images/explosion.png';
        ship.isStatic = true;
        isRunning = false;

        // You're dead!
        setTimeout(function() {
            World.clear(engine.world);
            Engine.clear(engine);
            Events.off(engine, tickEvent);

            alert('Game over!');

        }, 500);
    }

});

// create a spaceship!
var ship = Bodies.rectangle(400, 320, 40, 40, {
    id: "ship",
    frictionAir: 0.1,
    mass: 0,
    torque: 0,
    render: {
        sprite: {
            texture: '/images/ship.png'
        }
    }
});

// add ship to the world
World.add(engine.world, [ship]);

// keypress events
var keyPressed;

document.addEventListener("keyup", function(event){
    keyPressed = null;
});

document.addEventListener("keydown", function(event){
    var key = event.which;

    if(isRunning) {
        if(key === 38) {
            event.preventDefault();
            moveShipUp();
        } else if (key  === 37) {
            event.preventDefault();
            moveShipBack();
        } else if (key === 39) {
            event.preventDefault();
            moveShipForward();
        } else if(key === 32 && keyPressed !== key) {
            event.preventDefault();
            shootFromShip();
        } else {
            return;
        }
    }

    keyPressed = key;
});

// run the engine
Engine.run(engine);

function addTerrain() {
   addTerrainPieceTop();
   addTerrainPieceBottom();
}

// add some terrain
addTerrain();

function addTerrainPieceTop() {

    var containerWidth = compositeTerrain.width;
    var randomHeight = randomIntFromInterval(rangeTerrain.from, rangeTerrain.to);

    var terrainBody = Bodies.rectangle(
        worldWidth + 20,
        0 + randomHeight / 2,
        50,
        randomHeight,
        {
            isStatic: true,
            id: "building",
            friction: 0.1,
            render: {
                sprite: {
                    texture: '/images/rocks_top.png'
                }
            }
        }
    );

    Composite.add(compositeTerrain, terrainBody);

    // Add terrain to the world
    World.add(engine.world, [terrainBody]);
}

function addTerrainPieceBottom() {

    var containerWidth = compositeTerrain.width;
    var randomHeight = randomIntFromInterval(rangeTerrain.from, rangeTerrain.to);

    var terrainBody = Bodies.rectangle(
        worldWidth + 25,
        worldHeight - (randomHeight / 2),
        50,
        randomHeight,
        {
            isStatic: true,
            id: "building",
            friction: 0.1,
            render: {
                sprite: {
                    texture: '/images/rocks_bottom.png'
                }
            }
        }
    );

    Composite.add(compositeTerrain, terrainBody);

    // Add terrain to the world
    World.add(engine.world, [terrainBody]);
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// shoot some laser
function shootFromShip() {
    var boundsShip = ship.bounds;

    var laser = Bodies.rectangle(
        boundsShip.min.x + 20,
        boundsShip.min.y + 20,
        5,
        5,
        {
            density: 0.001,
            friction: 0,
            frictionAir: 0,
            angle: randomIntFromInterval(-360, 360) * (Math.PI / 180),
            render: {
                fillStyle: 'white',
                strokeStyle: 'white'
            },
            collisionFilter: {
                mask: null
            }
        }
    );

    Body.applyForce(laser, {
        x: boundsShip.min.x,
        y: boundsShip.min.y
    }, {
        x: 0.0009,
        y: -0.0009
    });

    World.add(engine.world, [laser]);

    laserShots.push(laser);
}

function moveShipUp (direction) {
    Body.applyForce(ship, {
        x: 0, y: 0
    }, {
        x: 0 , y: -0.1
    });
}

function moveShipBack (direction) {
    Body.applyForce(ship, {
        x: 0, y: 0
    }, {
        x: -0.1, y: 0
    });
}

function moveShipForward (direction) {
    Body.applyForce(ship, {
        x: 0, y: 0
    }, {
        x: 0.1 , y: 0
    });
}

// shoot some missile
function shootMissile() {
    var randomPos = randomIntFromInterval(0, worldWidth);

    var missile = Bodies.rectangle(
        randomPos,
        worldHeight,
        25,
        50,
        {
            mass: 10,
            friction: 0,
            torque: 0.15,
            collisionFilter: {
                mask: null
            },
            render: {
                sprite: {
                    texture: '/images/missile.png'
                }
            }
        }
    );

    Body.applyForce(missile, {
        x: randomPos,
        y: worldHeight
    }, {
        x: 0,
        y: -1
    });

    World.add(engine.world, [missile]);
    missiles.push(missile);

}

// some missile interval shooting
setTimeout(function() {
    setInterval(function() {
        if(isRunning) {
            shootMissile();
        }
    }, 2000);
}, 1000);
