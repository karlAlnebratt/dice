"use strict";

// Matter.js module aliases
var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;
var Query = Matter.Query;


// create a Matter.js engine
var engine = Engine.create(document.body, {
    render: {
        options: {
            background: '/images/stars.jpg',
            wireframes: false
        }
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


Events.on(engine, 'tick', function(event) {
    var hitground = Query.region([ship], ground.bounds);
    var top = ship.position.y;

    if(hitground.length || top <= 20) {
        ship.render.sprite.texture = '/images/explosion.png';
        ship.isStatic=true
        // Body.resetForcesAll(ship);
    }
});

//Move ship
function moveShipUp (direction) {
    Body.applyForce(ship, {x: 0, y: 0}, {x: 0, y: -0.1});
}
