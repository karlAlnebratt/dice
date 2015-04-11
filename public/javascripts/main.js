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
    },
    buildingHeightRange = {
        from: 50,
        to: 400
    };

var compositeBuildings = Composite.create();

// add some terrain
addTerrain(20);

// Get width of composite by last body position and width
var buildingComposites = Composite.allComposites(compositeBuildings);
var buildingComposite = buildingComposites[0];
var buildingBodies = Composite.allBodies(buildingComposite);
var lastBuildingBody = buildingBodies[buildingBodies.length - 1];
var buildingCompositeMinX = lastBuildingBody.bounds.min.x;

console.log(buildingCompositeMinX);

// apply force to terrain bodies
Events.on(engine, 'tick', function (event) {
    //Body.applyForce(terrainBodies[0], {x: 0, y: 0}, {x: -100, y: 0});

    // for(var i = 0; i < terrainBodies.length; i++) {
    //     Body.translate(terrainBodies[i], { x: -5, y: 0 });
    // }

    //Body.translate(composite.allBodies(), { x: -5, y: 0});

    var buildingComposites = Composite.allComposites(compositeBuildings);

    for(var i = 0; i < buildingComposites.length; i++) {
        // Get composite
        var buildingComposite = buildingComposites[i];

        // Set position
        Composite.translate(buildingComposite, { x: -2, y: 0 });

        // Get corresponding bodies in composite
        var buildingBodies = Composite.allBodies(buildingComposite);

        // Get last body in composite
        var lastBuildingBody = buildingBodies[buildingBodies.length - 1];

        if(lastBuildingBody.position.x <= -buildingProp.width) {

            Composite.translate(buildingComposite, { x: worldWidth + buildingCompositeMinX + buildingProp.width, y: 0 });

            break;
        }
    }

    var hitground = Query.region([ship], ground.bounds);
    var top = ship.position.y;

    if(hitground.length || top <= 20) {
        ship.render.sprite.texture = '/images/explosion.png';
        ship.isStatic=true
        // Body.resetForcesAll(ship);
    }

});

// create two boxes and a ground
var ship = Bodies.rectangle(400, 60, 40, 40, {
    id: "ship",
    frictionAir: 0.05,
    render: {
        sprite: {
            texture: '/images/ship.png'
        }
    }
});
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [ship, ground]);

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

// for adding random terrain
function addTerrain(numBodies) {

    // Always have two groups of buildings
    var numGroups = 2,
        startPos = 0,
        bodiesCreated = 0;

    for(var j = 0, len = numGroups; j < len; j++) {

        // Create a new composite to store buildings in
        var composite = Composite.create();

        // Set position for group
        startPos = bodiesCreated;

        for (var i = 0, len2 = numBodies; i < len2; i++) {

            // Set random height
            buildingProp.height = randomIntFromInterval(
                buildingHeightRange.from,
                buildingHeightRange.to
            );

            var terrainBody = Bodies.rectangle(
                (buildingProp.width * i) + startPos + (buildingProp.width / 2),
                buildingProp.y,
                buildingProp.width,
                buildingProp.height,
                { isStatic: true, id: "building", friction: 0.1, render: { fillStyle: j === 1 ? 'green' : 'blue' } }
            );

            terrainBodies.push(terrainBody);

            // Add building to the world
            World.add(engine.world, [terrainBody]);

            // Add building to the current composite
            Composite.addBody(composite, terrainBody);

            // Bodies created
            bodiesCreated = buildingProp.width * (i + 1);
        }

        // Add composite to parent
        Composite.add(compositeBuildings, composite);
    }
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function moveShipUp (direction) {
    Body.applyForce(ship, {x: 0, y: 0}, {x: 0, y: -0.1});
}
