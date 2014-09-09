function() {
    var HEIGHT = 300,
        WIDTH = 300,
        HEIGHT_PX = '300px',
        WIDTH_PX = '300px';

    var TrajectoryView = $('canvas').extend({
        render : function() {
            var canvas = $("<canvas/>").height(HEIGHT).width(WIDTH);
            var iv = new iview(canvas);
            var container = $('<div/>').css({width: HEIGHT_PX, height: WIDTH_PX})
                .resizable({
                    aspectRatio: 1,
                    resize: function(event, ui) {
                        iv.renderer.setSize(ui.size.width, ui.size.height);
                    }
                });
            container.append(canvas);
            this.setElement(container);
            this.iv = iv;
            this.setupFullScreen(canvas, container);
            this.update();
            
            // contextMenu
            //context.init({preventDoubleContext: true});
            //var menu = [{header: 'Export as...'},
            //        {text: 'PNG',
            //        action: function () {
            //            var dataURL = iv.renderer.domElement.toDataURL('image/png');
            //            var data = atob( dataURL.substring( "data:image/png;base64,".length ) ),
            //                    asArray = new Uint8Array(data.length);
            //            for( var i = 0, len = data.length; i < len; ++i ) {
            //                    asArray[i] = data.charCodeAt(i);    
            //            }
            //            var blob = new Blob( [ asArray.buffer ], {type: "image/png"} );
            //            saveAs(blob,"mol.png")
            //        }
            //    }, { 
            //        text: 'OBJ',
            //        action: function () {
            //           var obj = '';
            //           var exporter = new THREE.OBJExporter();
            //           iv.mdl.children.forEach( function (object) {
            //               obj = obj + String(exporter.parse(object.geometry));
            //           });
            //           var blob = new Blob([obj], { type : "text/obj;charset=utf-8"});
            //           saveAs(blob, "mol.obj");
            //        }
            //    }];
            //context.attach('canvas',menu)

            // debugging
            window.iv = this.iv;
            window.model = this.model;
        },

        update : function () {
            /* This could definitely be done more efficiently. Right now we're
            just recreating and redrawing everything. For the (presumably)
            common use case where you just want to update the positions to the
            next frame in a trajectory, there's no real need to redefine the
            topology and representation.
            */

            console.log('TrajectoryView.update');

            this.iv.loadTopology(this.model.attributes._topology);
            this.iv.loadCoordinates(this.model.attributes._frameData.coordinates);
            this.iv.loadAtomAttributes(this.model.attributes._frameData.secondaryStructure);

            var options = {
                'camera': this.model.attributes.camera,
                'background': this.model.attributes.background,
                'colorBy': this.model.attributes.colorBy,
                'primaryStructure': this.model.attributes.primaryStructure,
                'secondaryStructure': this.model.attributes.secondaryStructure,
                'surface': this.model.attributes.surfaceRepresentation
            };
            this.iv.zoomInto(options);

            return TrajectoryView.__super__.update.apply(this);
        },


        setupFullScreen : function(canvas, container) {
            // currently only works in chrome. need other prefixes for firefox
            var iv = this.iv;
            canvas.dblclick(function () {
            	if ('webkitCancelFullScreen' in document) {
                    if (!document.webkitIsFullScreen) {
                        var minHW = Math.min(screen.width, screen.height);
                		canvas[0].webkitRequestFullScreen();
                        iv.renderer.setSize(minHW, minHW);
                        iv.render();
                    }
                }
            });

            document.addEventListener("webkitfullscreenchange", function() {
                if (!document.webkitIsFullScreen) {
                    iv.renderer.setSize(WIDTH, HEIGHT);
                    iv.render();
                    container.css({width: HEIGHT_PX, height: WIDTH_PX});
                }
            });
        },
    });
    WidgetManager.register_widget_view('TrajectoryView', TrajectoryView);
}
