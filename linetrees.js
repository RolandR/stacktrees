

/*
	========================================================================
	Stack Trees
	
	Drawing pretty trees by stacking a bunch of ellipses upon each other.
	
	Copyright (C) 2017 Roland Rytz <roland@draemm.li>
	Licensed under the GNU Affero General Public License Version 3
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of the
	License, or (at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
	For more information, see the LICENSE file.
	
	========================================================================
*/


var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var canvasContainer = document.getElementById("canvasContainer");

canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight*3;

var zStep = 0.5;
var branchProbability = zStep * 0.025;
var maxDirection = 1.5;
var changeRate = zStep * 0.2;
var maxR = 50;
var leafLength = 8;
var leafWidth = 4;
var maxBranches = 1000;
var branchEllipse = 0.5;
var leafProbability = zStep * 0.3;
var leafStem = 10;
var maxLeafsPerCluster = 6;


var branches = [];

branches.push({
	r: maxR,
	targetR: maxR,
	x: 0,
	y: 0,
	dirX: 0,
	dirY: 0,
});

var z = 0;

context.lineWidth = 0.1;
context.fillStyle = "#FFFFFF";
context.strokeStyle = "#666666";

step();

function draw(){
	
	for(let branch of branches){
		
		context.lineWidth = 0.3 + (Math.random()-0.5)*0.2;
		context.beginPath();
		context.fillStyle = "#FFFFFF";
		
		var screenX = canvas.width/2;
		var screenY = canvas.height - 100 - z;
		
		var angle = Math.atan(branch.dirX);
		
		screenX += branch.x + Math.random();
		screenY += branch.y * 0.4 + Math.random();
		
		var localBranchEllipse = branchEllipse + branchEllipse * (branch.dirY);

		//context.moveTo(screenX+branch.r, screenY);
		//context.arc(screenX, screenY, branch.r, 0, 2*Math.PI);
		context.ellipse(
			screenX,
			screenY,
			branch.r,
			branch.r*Math.max(0.3, localBranchEllipse),
			angle,
			0,
			2*Math.PI
		);

		context.fill();
		context.stroke();
		
		context.beginPath();
		
		var unthickness = 1-(branch.r / maxR);
		if(Math.random() < unthickness*unthickness*unthickness - 0.5 && Math.random() < leafProbability){
			//generate leaf cluster
			
			for(let i = 0; i < Math.random()*maxLeafsPerCluster+1; i++){
			
				var rotation = Math.random() * 2 * Math.PI;
				
				var startX = Math.cos(rotation) * branch.r;
				var startY = localBranchEllipse * Math.sin(rotation) * branch.r;
				
				var leafX = Math.cos(rotation) * (branch.r + leafLength + leafStem);
				var leafY = localBranchEllipse * Math.sin(rotation) * (branch.r + leafLength + leafStem);
				
				
				context.moveTo(screenX, screenY);
				context.ellipse(screenX + leafX, screenY + leafY, leafLength + leafLength * (Math.random()-0.5), leafWidth * (Math.random()*0.8+0.2), rotation, 0, 2*Math.PI);
				
			}
			
		}
		
		//context.fillStyle = "rgba(255, 255, 255, 0.5)";
		context.fill();
		context.stroke();
		
	}
}

function step(){
	
	
	for(let branch of branches){
		
		
		var thickness = branch.r / maxR;
		var localMaxDir = maxDirection * (1-thickness + 0.1);
		var localChangeRate = changeRate * (1-thickness + 0.3);
		
		
		branch.dirX += (Math.random()-0.5) * localChangeRate;
		branch.dirY += (Math.random()-0.5) * localChangeRate;
		
		branch.dirX = Math.min(Math.max(branch.dirX, 0-localMaxDir), localMaxDir);
		branch.dirY = Math.min(Math.max(branch.dirY, 0-localMaxDir), localMaxDir);
		
		branch.x += zStep * branch.dirX;
		branch.y += zStep * branch.dirY;
		
		//branch.r = branch.r * 0.999 - 0.05;
		
		branch.r = branch.r - zStep * 0.03;
		
		if(branch.r > branch.targetR){
			branch.r = branch.r * (1-0.001*zStep) - zStep * 0.03;
		}
	}
	
	for(let branch of branches){
		var thickness = branch.r / maxR;
		var localBranchProbability = branchProbability * (Math.pow(1-thickness, 4)+0.2);
		
		if(Math.random() < localBranchProbability && branches.length <= maxBranches){
			branch.targetR = branch.r * 0.6;
			branches.push({
				r: branch.r,
				targetR: branch.targetR,
				x: branch.x,
				y: branch.y+2,
				dirX: branch.dirX,
				dirY: branch.dirY,
			});
		}
	}
	
	let i = branches.length;
	while(i--){
		if(branches[i].r < 1){
			branches.splice(i, 1);
		}
	}
	
	z += zStep;
	
	draw();
	
	if(branches.length > 0){
		requestAnimationFrame(step);
	}
}