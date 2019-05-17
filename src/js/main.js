let ThreeIns;



window.onload = function()
{
    ThreeIns = new ThreeJsClass();
    window.ThreeIns = ThreeIns;
}
//test 



	function ThreeJsClass() {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage()
        };

        setTimeout(() => {
            let maxTime = 0;
            bisN = true;
            particles_wave.forEach(function (e,i,arr)
            {
                let time_exec = Math.random() * 500 + 500 ;
                let time_delay = Math.random() * 300 ;
                maxTime =( maxTime > time_exec + time_delay ?maxTime :time_exec + time_delay );
                let tweenIns = new TWEEN.Tween(e.position).to(
                    {
                        x:wave_coord[i].x, 
                        y:wave_coord[i].y,
                        z:wave_coord[i].z
                    },time_exec).easing(TWEEN.Easing.Quadratic.InOut).delay(time_delay);
                tweenIns.start();
            });

            setTimeout(() => {
                bWavesing = true;
            }, maxTime - 200);
        }, 1000);

        let container, stats;
        let camera, scene, renderer, geometry, materials = [], parameters, i, h, color, size;
        let mouseX = 0, mouseY = 0;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        let geom;
        let mat;

        let bflag = true;
        let bWavesing = false;
        let bisN = false;
        let clock = new THREE.Clock();

        /**
         * 辉光
         * */

        let composer, mixer;
        let params = {
            exposure: 2,
            bloomStrength: 2,
            bloomThreshold: 0,
            bloomRadius: 0
        };

        /**
         * 辉光
         */
         
        /**
         * 波浪 start
         */

        const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;
        let particles_wave = new Array();
        let particle_wave;
        let geometry_wave = new THREE.Geometry();
        let count_wave = 1;
        let wave_coord = new Array();
        
        /**
         * 波浪 end
         */

         /**
         *  smoke start 
         */


        let smoke_particles = [];


        /**
         *  smoke end 
         */


        /**
         * img 数据 start
         */
        let canvas = document.createElement('canvas');
        let content = canvas.getContext('2d');
        let img = new Image();
        let imgData ;
        img.src = "static/img/5.png";
        canvas.style.position = 'absolute';

        if (window.innerWidth > 720)
        {
            canvas.width = 250;
            canvas.height = 250;
        }
        else 
        {
            canvas.width = 200;
            canvas.height = 200;
        }

        
        canvas.style.display = 'none';

        let imgCoord = [];
        let imgVecColor = [];
        /**
         * img 数据 end
         */

        this.init = function()
        {
            let _this = this;
            img.onload = function () {
                content.drawImage(img, 0, 0 ,canvas.width, canvas.height);
                imgData = content.getImageData(0,0,canvas.width, canvas.height);
                _this.initThreeJS();
            };
        }

        this.initPost = function()
        {
            console.log('init postprocess');

            composer = new THREE.EffectComposer( renderer );
            console.log(composer);
            composer.setSize( window.innerWidth, window.innerHeight );
            let pass = new THREE.RenderPass( scene, camera );
            composer.addPass(  pass );

            
            let pass1 = new THREE.ShaderPass(THREE.SepiaShader);
            composer.addPass( pass1 );
            pass1.renderToScene = true;

            //let pass2 = new THREE.ShaderPass(THREE.SepiaShader);
        }


        this.initThreeJS = function () {

            container = document.createElement('div');
            container.id = 'threejsDiv';

            document.body.appendChild(container);
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
            camera.position.z = 1000;
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x000000, 0.0005);


            console.log(renderer);
            renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
            renderer.autoClear = false;
            renderer.setClearColor(0x000000, 0);
            renderer.setSize(window.innerWidth, window.innerHeight);

            container.appendChild(renderer.domElement);
            stats = new Stats();
            //container.appendChild(stats.dom);
            document.addEventListener('mousemove',  onDocumentMouseMove,    false);
            document.addEventListener('touchstart', onDocumentTouchStart,   false);
            document.addEventListener('touchmove',  onDocumentTouchMove,    false);
            window.addEventListener  ('resize',     onWindowResize,         false);

            this.initPost();

            geometry = new THREE.Geometry();
            geom = new THREE.Geometry();

            GenrateWaves();
            //GenrateSmoke();
            GenrateAround();
            var lights = [];

            lights[0] = new THREE.DirectionalLight(0xffffff, 1);
            lights[0].position.set(1, 0, 0);
            lights[1] = new THREE.DirectionalLight(0x11E8BB, 1);
            lights[1].position.set(0.75, 1, 0.5);
            lights[2] = new THREE.DirectionalLight(0x8200C9, 1);
            lights[2].position.set(-0.75, -1, 0.5);
            scene.add(lights[0]);
            scene.add(lights[1]);
            scene.add(lights[2]);

            animate();

        }

        function IsTransparent(x, y) {
            let total = canvas.width * canvas.height * 4;
            let index = total - (x * canvas.height * 4) + (y * 4);
            return (parseInt(imgData.data[index + 3]) != 0);
        }

        function GetVecColor(x, y) {
            let total = canvas.width * canvas.height * 4;
            let index = total - (x * canvas.height * 4) + (y * 4);
            let color = new THREE.Color(imgData.data[index] / 255, imgData.data[index + 1] / 255, imgData.data[index + 2] / 255);
            return color;
        }

        function GenrateSmoke()
        {

            let loader = new THREE.TextureLoader();
            let smoke_t2d =  loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
            let smoke_mat = new THREE.MeshLambertMaterial({color: 0x00ffff, map: smoke_t2d, transparent: true});
            
            let textT2d = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/quickText.png');
            let text_mat = new THREE.MeshLambertMaterial({color: 0x00ffff, opacity: 1, map: textT2d, transparent: true, blending: THREE.AdditiveBlending});
            let smoke_geo = new THREE.PlaneGeometry(500,500);

            for (let p = 0; p < 50; p++) {
                let tempMesh =new THREE.Mesh(smoke_geo,smoke_mat);
                tempMesh.position.set( Math.random() * 1000 - 500,
                                       Math.random() * 1000 - 500,
                                       Math.random() * 500 );
                tempMesh.rotation.z =  Math.random() * 360;
                smoke_particles.push(tempMesh);
                scene.add(tempMesh);
                //tempMesh.lookAt(camera.position);
                
            }
        
            
        }

        function GenrateAround()
        {
            
            for (i = 0; i < 50; i++) {
                var vertex = new THREE.Vector3();
                vertex.x = Math.random() * 2000 - 1000;
                vertex.y = Math.random() * 2000 - 1000;
                vertex.z = Math.random() * 2010 - 1000;
                geometry.vertices.push(vertex);
                geometry.colors.push(1.0, 1.0, 1.0);
            }

            parameters = [
                [[1, 1, 0.5],    5],
                [[0.95, 1, 0.5], 8],
                [[0.90, 1, 0.5], 8],
                [[0.85, 1, 0.5], 8],
                [[0.80, 1, 0.5], 8]
            ];
            let loader = new THREE.TextureLoader();
            let t2d = loader.load('static/img/point1.png');
            for (i = 0; i < 5; i++) {
                //color = // [Math.random() * 255, Math.random() * 255, Math.random() * 255, Math.random() * 255];
                size = Math.random() * 10 + 1;

                materials[i] = new THREE.PointsMaterial(
                    {
                        transparent:true, //使材质透明
                        blending:THREE.AdditiveBlending, //
                        depthTest:false, //深度测试关闭，不消去场景的不可见
                        size: size,
                        map:t2d
                    });
                let particles = new THREE.Points(geometry, materials[i]);

                particles.rotation.x = Math.random() * 0;
                particles.rotation.y = Math.random() * 6;
                particles.rotation.z = Math.random() * 6;

                particles.name = 'around';
                scene.add(particles);
            }
        }

        function GenrateWaves() {

            let partile_geometry = new THREE.SphereGeometry( 1, 32, 16 );
            //let temp_color = new THREE.Color().setRGB(152,215,233);
            let temp_color = new THREE.Color().setRGB(244,244,244);
            let temp_mat = new THREE.LineBasicMaterial( { color:temp_color } );

            let loader = new THREE.TextureLoader();
            let t2d = loader.load('static/img/point1.png');

            let i_wave = 0;
            for ( let ix = 0; ix < AMOUNTX; ix++ ) {
                for ( let iy = 0; iy < AMOUNTY; iy++ ) {
                    //let temp_sprite_color = new THREE.Color().setRGB(125,253,255);
                    let temp_sprite_color = new THREE.Color().setRGB(0,253,255);
                    let material_wave = new THREE.SpriteMaterial({
                        map: t2d,
                        //useScreenCoordinates: false, 
                        color: temp_sprite_color, 
                        transparent: true, 
                        blending: THREE.AdditiveBlending
                    });

                    wave_coord.push(new THREE.Vector3 ( ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2),  -500 ,iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2) ) );
                    let follow_particle = new THREE.Sprite(material_wave);
                    let particle_mesh = new THREE.Mesh( partile_geometry, temp_mat );
                    particle_wave = particles_wave[i_wave++] = particle_mesh;
                    
                    particle_wave.position.x = Math.random() * 9000 - 4500;
                    particle_wave.position.z = Math.random() * 9000 - 4500;
                    particle_wave.position.y = Math.random() * 9000 - 4500;
                    
                    particle_wave.scale.x = particle_wave.scale.y = Math.random() * 5 + 1;
                    follow_particle.scale.set(2.4, 2.4, 2.4);
                    particle_wave.add(follow_particle);

                    scene.add(particle_wave);

                    if (i_wave > 0) 
                    {
                        geometry_wave.vertices.push(particle_wave.position);
                    }
                }
            }
            console.log(particle_wave);
        }

        this.GenrateGeom = function (_geom) {
            console.log(canvas.height);
            let temp_subHeight =  (canvas.height < 250 ? canvas.height * 1.5 : canvas.height);
            for (var x = 0; x < canvas.width; x++) {
                for (var y = 0; y < canvas.height; y++) {
                    let vec = new THREE.Vector3(y - canvas.width / 2,
                                                x - canvas.height / 2,
                                                1000 - temp_subHeight);

                    let vec_random = new THREE.Vector3( Math.random() * document.body.clientWidth * 4 - document.body.clientWidth * 2,
                                                        Math.random() * document.body.clientHeight * 4 - document.body.clientHeight * 2,
                                                        Math.random() * 4000 - 2000);

                    if (IsTransparent(x, y)) {
                        let color = GetVecColor(x, y);

                        _geom.vertices.push(vec_random);
                        _geom.colors.push(color);
                        imgCoord.push(vec);
                        imgVecColor.push(color);
                    } 
                }
            }
            _geom.center();

            mat = new THREE.PointsMaterial({size: 2, vertexColors: true});
            let cloud = new THREE.Points(geom, mat);

            cloud.name = 'ImageParticle';
            cloud.rotation.y = Math.PI * 1.8;
            scene.add(cloud);
        }

        this.tweenAnim = function tweenObj(index) {
            if (geom.vertices.length <= 0)
            {
                this.GenrateGeom(geom);
            }
            else 
            {

                geom.vertices.forEach(function (e, i, arr) {
                    let tweenIns = new TWEEN.Tween(e).to(
                        {
                            x: imgCoord[i].x,
                            y: imgCoord[i].y,
                            z: imgCoord[i].z
                        }, Math.random() * 750 ).easing(TWEEN.Easing.Quadratic.InOut)
                        .delay(Math.random() * 250 );
                    tweenIns.start();
    
                });
    
            }

        };

        this.tweenAnim1 = function tweenObj(index) {
            geom.vertices.forEach(function (e, i, arr) {

                if (Math.random() * 100 > 0) {
                    let tweenIns = new TWEEN.Tween(e).to(
                        {
                            x: imgCoord[i].x * 10,
                            y: imgCoord[i].y * 10,
                            z: imgCoord[i].z * 2 > 1000 ? e.z * 2 : 1001//e.z
                        }, Math.random() * 750 ).easing(TWEEN.Easing.Quadratic.InOut)
                        .delay(Math.random() * 250);
                    tweenIns.start();
                } else {


                }

            })

        };


        this.tweenAnim2 = function tweenObj(index) {
            for (let sceneItem of scene.children) {
                sceneItem.name = "ImageParticle";
            }
            setTimeout(() => {
                for (let sceneItem of scene.children) {
                    sceneItem.material.size = 2.5;
                }
            }, 1500);

            geometry.vertices.forEach(function (e, i, arr) {
                let tweenIns = new TWEEN.Tween(e).to(
                    {
                        x: imgCoord[i].x,
                        y: imgCoord[i].y,
                        z: imgCoord[i].z//e.z
                    }, Math.random() * 500).easing(TWEEN.Easing.Quadratic.In)
                    .delay(Math.random() * 500)
                    .onUpdate(function (i) {
                            geometry.colors[i] = imgVecColor[i];
                        }
                    );
                tweenIns.start();
            });
        };

        this.tweenAnim3 = function () {
            let bflag = true;
            let bWavesing = false;
        };

        function onWindowResize() {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onDocumentMouseMove(event) {
            mouseX = event.clientX - windowHalfX;
            mouseY = event.clientY - windowHalfY;
        }

        function onDocumentTouchStart(event) {
            if (event.touches.length === 1) {
                event.preventDefault();
                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;
            }
        }

        function onDocumentTouchMove(event) {
            if (event.touches.length === 1) {
                event.preventDefault();
                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;
            }
        }

        //
        function animate(time) {
            requestAnimationFrame(animate);
            TWEEN.update(time);
            render();
            stats.update();
        }


        function render() {
            var time = Date.now() * 0.00005;

            if (((mouseX - camera.position.x) > 0 && camera.position.x <  50) ||
                ((mouseX - camera.position.x) < 0 && camera.position.x > -50)) {
                camera.position.x += (mouseX - camera.position.x) * 0.002;
            }
            if (((mouseY - camera.position.y) > 0 && camera.position.y < 50) ||
                ((mouseY - camera.position.y) < 0 && camera.position.y > -50)) {
                camera.position.y += (mouseY - camera.position.y) * 0.005;
            }
            
            camera.lookAt(scene.position);

            geom.verticesNeedUpdate = true;
            geom.colorsNeedUpdate = true;
            geometry.verticesNeedUpdate = true;
            geometry.colorsNeedUpdate = true;


            render_around(time);
            render_wave();
            //render_smoke(time);

            
            
            renderer.render(scene, camera);
            //console.log(composer);
            //composer.render(clock.getDelta());
        }

        function render_smoke(time)
        {
            let delta = clock.getDelta();
            for(let i =0;i < smoke_particles.length ;i++ )
            {
                 
               // smoke_particles[i].rotation.x += 0.005;
               // smoke_particles[i].rotation.y += 0.01;
                //smoke_particles[i].position.set(Math.random() * Math.PI / 1080, Math.random() * Math.PI / 180, Math.random() * Math.PI / 180);
                smoke_particles[i].rotation.z += Math.random() * delta * 0.1;
                //smoke_particles[i].position.z =(Math.sin(0.5) * 500);

            }
        }

        function render_around(time)
        {
            let i_around = 0;
            for (let i = 0; i < scene.children.length; i++) {
                var object = scene.children[i];
                if (object.name === 'around' && object instanceof THREE.Points) {
                    object.rotation.y = time * (i_around < 4 ? i_around + 1 : -(i_around + 1)) * 2.5;
                    i_around++;
                }
                else if (object.name === 'ImageParticle') {
                    if (object.rotation.y < 6.28318) 
                    {
                        object.rotation.y += Math.PI / 180 * 2;
                    } 
                    else if (bflag) 
                    {
                        bflag = false;
                        console.log(object.rotation.y);
                        object.rotation.y = 6.283185307179586;
                        ThreeIns.tweenAnim();
                    }
                }
            }
        }

        function render_wave() {
            let i_wave = 0;

            if ((particles_wave.length > AMOUNTX * AMOUNTY)) {
                return;
            }

            if ( bWavesing  )
            {
                count_wave += 0.1;
                /**waves */
                for (let ix = 0; ix < AMOUNTX; ix++) {
                    for (let iy = 0; iy < AMOUNTY; iy++) {
                        let tx = ix;
                        let ty = iy;

                        particle_wave = particles_wave[i_wave++];
                        
                        particle_wave.position.y = particle_wave.position.y + Math.sin((tx + count_wave) * 0.3) * 1.5  + (Math.sin((ty + count_wave) * 0.5)) ;
                        particle_wave.scale.x = particle_wave.scale.y = (Math.sin((tx + count_wave) * 0.3) + 1) * 2.5 + (Math.sin((ty + count_wave) * 0.5) + 1) * 2.5;
                    }
                }
            }
            else 
            {   
                if (!bisN)
                {
                    for (let ix = 0; ix < AMOUNTX; ix++) {
                        for (let iy = 0; iy < AMOUNTY; iy++) {
                            
                            particle_wave = particles_wave[i_wave++];
                            let temp_rad = 0.05;//Math.random() * 0.05 + 0.01 ;

                            particle_wave.position.x = particle_wave.position.z * Math.sin(temp_rad) + particle_wave.position.x * Math.cos(temp_rad);
                            particle_wave.position.z = particle_wave.position.z * Math.cos(temp_rad) - particle_wave.position.x * Math.sin(temp_rad);
                        }
                    }
                }


            }
            //tex+= 0.1;
        }

        this.init();
    }



export default ThreeIns;