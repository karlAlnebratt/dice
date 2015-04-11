"use strict";

// Matter.js module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body,
    Events = Matter.Events;

var worldWidth = 800,
    worldHeight = 600;

// create a Matter.js engine
var engine = Engine.create(document.body, {
    render: {
        options: {
            width: worldWidth,
            height: worldHeight,
            background: 'darkRed',
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
});


var jumper;
Events.on(engine, 'mousedown', function(event) {
    var mousePosition = event.mouse.position;
    // jumper.force = {
    //     x: 0.001,
    //     y: -0.51
    // };
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
                { isStatic: true, id: "building", friction: 0.001, render: { fillStyle: j === 1 ? 'green' : 'blue' } }
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
