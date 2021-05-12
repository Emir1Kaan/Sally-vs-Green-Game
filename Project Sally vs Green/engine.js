var game = {
	init: function(){
		objects.init();
		window.addEventListener("load", this.load);
		window.addEventListener("resize", view.refreshSize);
	},
	load: function(){
		graphics.load();
		view.refreshSize();
		input.load();
		assets.load = function(){
			game.loop();
		};
		assets.start();
	},
	loop: function(){
		game.update();
		game.draw();
		window.requestAnimationFrame(game.loopSkip);
	},
    loopSkip: function(){
        window.requestAnimationFrame(game.loop)
    },
	update: function(){
		scene.update();
		input.update();
		for(i in scene.instances){
			var o = scene.instances[i];
			o.update();
			o.doPhysics();
		}
		input.refresh();
		view.update();
	},
	draw: function(){
		graphics.clear();
		for(i in scene.instances){
			var o = scene.instances[i];
			o.draw();
			if(o.useGraphics){
				graphics.drawObject(o);
			}
		}
	},
};

var scene = {
	instances: [],
	willCreate: [],
	willDestroy: [],
	name: null,
	createInstance: function(func,prop){
		var obj = new func();
		utils.buildProperty(obj,prop);
		this.willCreate.push(obj);
		return obj;
	},
	destroyInstance: function(obj){
		for(i in this.instances){
			if(this.instances[i] == obj){
				this.instances.splice(i,1);
				this.willDestroy.push(obj);
			}
		}
	},
	load: function(scene){
		this.instances.splice(0,this.instances.length);
		for(i in scene){
			this.createInstance(scene[i].type,scene[i].properties);
		}
	},
	update: function(obj){
		if(this.willCreate.length>0){
			for(i in this.willCreate){
				this.instances.push(this.willCreate[i]);
				this.willCreate[i].create();
			}
			this.willCreate.splice(0,this.willCreate.length);
			this.sort();
		}
		if(this.willDestroy.length>0){
			for(i in this.willDestroy){
				this.willDestroy[i].destroy();
			}
			this.willDestroy.splice(0,this.willDestroy.length);
		}
	},
	sort: function(){
		this.instances.sort(this.sortHelper);
	},
	sortHelper: function(a,b){
		return a.depth-b.depth;
	},
};

var graphics = {
	canvas: null,
	context: null,
	load: function(){
		this.canvas = document.getElementById("drawCanvas");
		this.context = this.canvas.getContext("2d");
	},
	drawImage: function(img,x,y,w,h){
		this.context.drawImage(img,(x-view.x)|0,(y.view.y)|0,w|0,h|0);
	},
	drawObject: function(obj){
		var x = (obj.x-(obj.scenterX||obj.centerX)-view.x)|0;
		var y = (obj.y-(obj.scenterY||obj.centerY)-view.y)|0;
		this.context.drawImage(obj.sprite,x,y,(obj.swidth||obj.width)|0,(obj.sheight||obj.height)|0);
	},
	clear: function(){
		this.context.fillStyle = "cornflowerblue";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},
	setSize: function(w,h){
		this.canvas.width = w;
		this.canvas.height = h;
	},
};

var view = {
	x: 0, y: 0, width: 800, height: 600, _fs: false,
	autoSize: false,
	followObject: null,
	update: function(){
		if(this.followObject){
			this.x = this.followObject.x-this.width/2;
			this.y = this.followObject.y-this.height/2;
		}
	},
	switchFullscreen: function(){
		if(this._fs){
			utils.cancelFullscreen(document);
		} else {
			utils.requestFullscreen(gameDiv);
		}
		this._fs = !this._fs;
	},
	refreshSize: function(){
		if(view.autoSize){
			view.width = window.innerWidth;
			view.height = window.innerHeight;
		}
		graphics.setSize(view.width,view.height);
	},
};

var input = {
	keys: [],
	mouse: {x: 0,y: 0,rx: 0,ry: 0},
	enableGamepad: true,
	load: function(){
		for(var i=0;i<256;i++){
			input.keys[i]={pressed: false,released: false,hold: false};
		}
		window.addEventListener("keydown",function(e){input.handleKey(e.keyCode,false,e.repeat);});
		window.addEventListener("keyup",function(e){input.handleKey(e.keyCode,true);});
		window.addEventListener("mousemove",function(e){
			input.mouse.rx = e.clientX;
			input.mouse.ry = e.clientY;
		});
		graphics.canvas.addEventListener("mousedown",function(e){
			input.keys[utils.getKeyCode(e.button)].pressed = true;
			input.keys[utils.getKeyCode(e.button)].hold = true;
		});
		graphics.canvas.addEventListener("mouseup",function(e){
			input.keys[utils.getKeyCode(e.button)].released = true;
			input.keys[utils.getKeyCode(e.button)].hold = false;
		});
		if(utils.mobilecheck())
		{
			if(this.enableGamepad){
				gamepadDiv.style.visibility = "visible";
			}
			gamepadUp.addEventListener("touchstart",function(e){input.handleKey(38,false);});
			gamepadUp.addEventListener("touchend",function(e){input.handleKey(38,true);});
			gamepadDown.addEventListener("touchstart",function(e){input.handleKey(40,false);});
			gamepadDown.addEventListener("touchend",function(e){input.handleKey(40,true);});
			gamepadLeft.addEventListener("touchstart",function(e){input.handleKey(37,false);});
			gamepadLeft.addEventListener("touchend",function(e){input.handleKey(37,true);});
			gamepadRight.addEventListener("touchstart",function(e){input.handleKey(39,false);});
			gamepadRight.addEventListener("touchend",function(e){input.handleKey(39,true);});
			document.body.addEventListener("contextmenu",function(e){
				input.handleMenu(false);
				setTimeout(input.handleMenu.bind(this,true),50);
				return false;
			});
		}
	},
	handleMenu: function(up){
		if(up){
			input.keys[2].released = true;
			input.keys[2].hold = false;
		} else {
			input.keys[2].pressed = true;
			input.keys[2].hold = true;
		}
	},
	handleKey: function(k,u,r=0){
		if(u){
			this.keys[k].released = true;
			this.keys[k].hold = false;
		} else {
			this.keys[k].pressed |= !r;
			this.keys[k].hold = true;
		}
	},
	update: function(){
		this.mouse.x = this.mouse.rx+view.x;
		this.mouse.y = this.mouse.ry+view.y;
	},
	refresh: function(){
		for(var i=0;i<256;i++){
			input.keys[i].pressed = false;
			input.keys[i].released = false;
		}
	},
};

var assets = {
	queue: [],
	finished: false,
	load: function(){},
	queueDownload: function(name,url){
		this.queue.push({name:name,url:url});
	},
	start: function(){
		if(this.queue.length==0){
			this.load();
			this.finished = true;
			return;
		}
		var pair = this.queue[this.queue.length-1];
		var img = new Image();
		img.addEventListener("load", function() {
			if(assets.queue.length>0){
				assets.queue.length -= 1;
			}
			assets.start();
        }, false);
		img.addEventListener("error", function() {
			alert("Error");
		}, false);
		img.src = pair.url;
		this[pair.name] = img;
	},
};

var objects = {
	baseObject: function(){},
	init: function(){
		var pro = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			switdth: 0,
			sheight: 0,
			centerX: 0,
			centerY: 0,
			scenterX: 0,
			scenterY: 0,
			useGraphics: false,
			sprite: null,
			usePhysics: false,
			isSolid: false,
			hspeed: 0,
			vspeed: 0,
			gravity: false,
			create: function(){},
			update: function(){},
			draw: function(){},
			destroy: function(){},
			depth: 0,
			doPhysics: function(){
				if(this.usePhysics){
					this.hspeed += this.gravity;
					this.x += this.vspeed;
					if(this.checkCollusion()){
						t = this.vspeed>0 ? -1 : 1;
						this.vspeed = 0;
					}
					while(this.checkCollusion()){
						this.x += t;
					}
					this.y += this.hspeed;
					if(this.checkCollusion()){
						t = this.hspeed>0 ? -1 : 1;
						this.hspeed = 0;	
					}
					while(this.checkCollusion()){
						this.y += t;
					}
				}
			},
			isColliding: function(a,x=0,y=0){
				return utils.aabbCollusion(this.x-this.centerX+x,this.y-this.centerY+y,this.width,this.height,
														a.x-a.centerX,a.y-a.centerY,a.width,a.height);
			},
			checkCollusion: function(x=0,y=0){
				for(i in scene.instances){
					var a = scene.instances[i];
					if(a != this && a.isSolid && a.isColliding(this,-x,-y))
						return true;
				}
				return false;
			},
		};
		utils.buildProperty(this.baseObject.prototype,pro);
	},
	createObject: function(o){
		var obj = function(){};
		obj.prototype = new this.baseObject();
		utils.buildProperty(obj.prototype,o);
		return obj;
	},
};

var utils = {
	aabbCollusion: function(ax,ay,aw,ah,bx,by,bw,bh){
		return ax < bx + bw &&
		ax + aw > bx &&
		ay < by + bh &&
		ah + ay > by;
	},
	buildProperty: function(obj,pro){
		for(i in pro){
			if(pro.hasOwnProperty(i)){
				obj[i] = pro[i];
			}
		}
		delete pro;
	},
	requestFullscreen: function(el){
		var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
		requestMethod.call(el);
	},
	cancelFullscreen: function(el){
		var cancelMethod = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullscreen;
		cancelMethod.call(el);
	},
	getKeyCode: function(i){
		if(i==0)
			return 1;
		else if(i==1)
			return 4;
		else if(i==2)
			return 2;
	},
	mobilecheck: function(){
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}
};
