"use strict";

// Matter.js module aliases
var worldWidth = 800;
var worldHeight = 600;

var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;
var Query = Matter.Query;
var Composite = Matter.Composite;

// create a Matter.js engine
var engine = Engine.create(document.body, {
    render: {
        options: {
            width: worldWidth,
            height: worldHeight,
            background: '/images/stars.jpg',
            wireframes: false
        }
    }
});

// references for terrain
var terrainBodies = [],
    buildingProp = {
        width: 40,
        height: null,
        y: 600
    }

var compositeTerrain = Composite.create();

// apply force to terrain bodies
Events.on(engine, 'tick', function (event) {

    Composite.translate(compositeTerrain, { x: -2, y: 0 });

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
            if(800 - 50 > terrainBody.bounds.min.x) {
                addTerrain();
            }
        }
    }

    var hitBuilding =  compositeTerrain.composites.filter(function(composite) {
        var isHit = Query.region(composite.bodies, ship.bounds);
        return !!isHit.length;
    });

    var top = ship.position.y;

    if(hitBuilding.length || top <= 20) {
        ship.render.sprite.texture = '/images/explosion.png';
        ship.isStatic=true;
    }

});

// create two boxes and a ground
var ship = Bodies.rectangle(400, 320, 40, 40, {
    id: "ship",
    frictionAir: 0.1,
    render: {
        sprite: {
            texture: '/images/ship.png'
        }
    }
});


// add all of the bodies to the world
World.add(engine.world, [ship]);

document.addEventListener("keydown", function(event){
    var key = event.which;

    if(key !== 38) {
        return;
    }

    event.preventDefault();
    moveShipUp();

});

// run the engine
Engine.run(engine);

function addTerrain() {
    addTerrainPieceTop();
    addTerrainPieceBottom();
}
addTerrain();

function addTerrainPieceTop() {

    var containerWidth = compositeTerrain.width;
    var randomHeight = randomIntFromInterval(50, 300);

    var terrainBody = Bodies.rectangle(
        825,
        0 + (randomHeight / 2),
        50,
        randomIntFromInterval(150, 250),
        {
            isStatic: true,
            id: "building",
            friction: 0.1,
            render: { fillStyle: 'blue', strokeStyle: null }
        }
    );

    Composite.add(compositeTerrain, terrainBody);

    // Add terrain to the world
    World.add(engine.world, [terrainBody]);
}

function addTerrainPieceBottom() {

    var containerWidth = compositeTerrain.width;
    var randomHeight = randomIntFromInterval(50, 300);

    var terrainBody = Bodies.rectangle(
        825,
        600 - (randomHeight / 2),
        50,
        randomHeight,
        {
            isStatic: true,
            id: "building",
            friction: 0.1,
            render: { fillStyle: 'blue', strokeStyle: null }
        }
    );

    Composite.add(compositeTerrain, terrainBody);

    // Add terrain to the world
    World.add(engine.world, [terrainBody]);
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function moveShipUp (direction) {
    Body.applyForce(ship, {
        x: 0, y: 0
    }, {
        x: 0, y: -0.1
    });
}
