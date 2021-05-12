game.init();

view.autoSize = true;
input.enableGamepad = true;

assets.queue = [
	{name: "sallystandleft",url: "sallystandleft.png"},
	{name: "sallystandright",url: "sallystandright.png"},
	{name: "sallywalk1left",url: "sallywalk1left.png"},
	{name: "sallywalk2left",url: "sallywalk2left.png"},
	{name: "sallywalk3left",url: "sallywalk3left.png"},
	{name: "sallywalk4left",url: "sallywalk4left.png"},
	{name: "sallywalk1right",url: "sallywalk1right.png"},
	{name: "sallywalk2right",url: "sallywalk2right.png"},
	{name: "sallywalk3right",url: "sallywalk3right.png"},
	{name: "sallywalk4right",url: "sallywalk4right.png"},
	{name: "bullet",url: "bullet.png"},
	{name: "tile",url: "tile.png"},
	{name: "playerright",url: "playerright.png"},
	{name: "playerleft",url: "playerleft.png"},
	{name: "point",url: "point.png"},
];

sally = objects.createObject({
	width: 40,
	height: 64,
	centerX: 20,
	centerY: 32,
	swidth: 64,
	sheight: 64,
	scenterX: 32,
	scenterY: 32,
	useGraphics: true,
	usePhysics: true,
	gravity: 1,
	create: function(){
		this.sprite = assets.playerright;
	},
	update: function(){
		if(input.keys[68].hold && input.keys[65].hold){
			this.vspeed = 0;
			this.walking = false;
		}else if(input.keys[68].hold){
			this.vspeed = 10; //4
			this.angle = true;
			this.walking = true;
		}else if(input.keys[65].hold){
			this.vspeed = -10; //4
			this.angle = false;
			this.walking = true;
		}else{
			this.vspeed = 0;
			this.walking = false;
		}
		if(input.keys[87].pressed && this.checkCollusion(0,1)){
			this.hspeed -= 20; //13
		}
		
		if(input.keys[70].pressed){
			scene.createInstance(bullet,{x:this.x,y:this.y,target:this.sprite==assets.sallystandright});
		}

		if(!this.angle){
			if(!this.walking){
				this.sprite = assets.sallystandleft;
			}else if(this.frame<10){
				this.sprite = assets.sallywalk1left;
			} else if(this.frame<20){
				this.sprite = assets.sallywalk2left;
			} else if(this.frame<30){
				this.sprite = assets.sallywalk3left;
			} else {
				this.sprite = assets.sallywalk4left;
			}
		} else {
			if(!this.walking){
				this.sprite = assets.sallystandright;
			}else if(this.frame<10){
				this.sprite = assets.sallywalk1right;
			} else if(this.frame<20){
				this.sprite = assets.sallywalk2right;
			} else if(this.frame<30){
				this.sprite = assets.sallywalk3right;
			} else {
				this.sprite = assets.sallywalk4right;
			}
		}
		if(this.frame == 40){
			this.frame = -1;
		}
		this.frame++;
	},
});

player = objects.createObject({
	width: 100,
	height: 100,
	centerX: 50,
	centerY: 50,
	useGraphics: true,
	usePhysics: true,
	gravity: 1,
	create: function(){
		this.sprite = assets.playerright;
		view.followObject = this;
	},
	update: function(){
		if(input.keys[39].hold && input.keys[37].hold){
			this.vspeed = 0;
		}else if(input.keys[39].hold){
			this.vspeed = 10;
			this.sprite = assets.playerright;
		}else if(input.keys[37].hold){
			this.vspeed = -10;
			this.sprite = assets.playerleft;
		}else{
			this.vspeed = 0;
		}
		if(input.keys[38].pressed && this.checkCollusion(0,1)){
			this.hspeed -= 20;
		}
		if(input.keys[96].pressed){
			scene.createInstance(bullet,{x:this.x,y:this.y,target:this.sprite==assets.playerright});
		}
	}
});

point = objects.createObject({
	width: 40,
	height: 64,
	centerX: 20,
	centerY: 32,
	swidth: 64,
	sheight: 64,
	scenterX: 32,
	scenterY: 32,
	useGraphics: true,
	usePhysics: true,
	gravity: 1,
	create: function(){
		this.sprite = assets.point;
		view.followObject = this;
	},
	
});


	
	
bullet = objects.createObject({
	width: 25,
	height: 25,
	useGraphics:true,
	depth: -1,
	create: function(){
		this.sprite = assets.bullet;
	},
	update: function(){
		if(this.checkCollusion()){
			scene.destroyInstance(this);
		}
		if(this.target){
			this.x+=20;
		}else{
			this.x-=20;
		}
	},
});


tile = objects.createObject({
	width: 64,
	height: 64,
	isSolid: true,
	useGraphics: true,
	create: function(){
		this.sprite = assets.tile;
	},
});



var map=`

########################
#                      #
#                      #
#                      #
#                      #
#    X      @         ##
##          #         ##
###                  ###
####              #    #
#              &       #    
########################
`.split(/\n/g);
var ss=[];
for(var y in map){
	var col=map[y];
	for(var x in col){
		if(col[x]=="@") { ss.push({type:point, properties:{x:x*64, y:y*64}}) }
		else if(col[x]=="#") { ss.push({type:tile, properties:{x:x*64, y:y*64}}) }
		else if(col[x]=="&") { ss.push({type:sally, properties:{x:x*64, y:y*64}}) }
		else if(col[x]=="X") { ss.push({type:player, properties:{x:x*100, y:y*100}}) }
	}
}
scene.load(ss);
