"use strict";

// Matter.js module aliases
var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;


// create a Matter.js engine
var engine = Engine.create(document.body);

// create two boxes and a ground
var ship = Bodies.rectangle(400, 0, 40, 40, { frictionAir: 0.05 });
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

function moveShipUp (direction) {
    Body.applyForce(ship, {x: 0, y: 0}, {x: 0, y: -0.1});
}
