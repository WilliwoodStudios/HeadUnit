
function emulator_RealTimeGauge(object, screen) {
    if (!object) {
        object = { };
    }

    var _private = {};

    object._size = undefined; // Always square

    function makeLabels(start,end,step) {
        var toReturn = [];
        var doSign = false;
        if (start < 0) {
            doSign = true;
        }
        for (var i=start; i<=end; i+= step) {
            if (doSign && i > 0) {
                toReturn.push("+" + i);
            } else {
                toReturn.push("" + i);
            }
        }
        return toReturn;
    }

    _private.config = {
        width: 420,
        height: 420,
        cx: 210,
        cy: 210,
        min: 0,
        max: 10,
        outer: {
            width: 14,
            radius: 193
        },
        needle: {
            width: 100,
            radius: 150
        },
        notches: [{
            count: 21,
            r1: 175,
            r2: 195,
            width: 4,
            style: "#7f7f7f"
        },{
            count: 11,
            r1: 170,
            r2: 195,
            width: 5,
            style: "#ffffff"
        }],
        labels: makeLabels(0,10,1),
        labelRadius: 140,
        angle: [0.75 * Math.PI, 2.25 * Math.PI],
        title: "TBA",
        titleRadius: 175
    };

    if ("speed" === object.mode) {
        _private.config.min = 0;
        _private.config.max = 240;
        _private.config.notches[0].count = 25;
        _private.config.notches[1].count = 13;
        _private.config.labels = makeLabels(0,240,20);
        _private.config.title = "km/h";
    }

    if ("rpm" === object.mode) {
        _private.config.min = 0;
        _private.config.max = 8000;
        _private.config.notches[0].count = 41;
        _private.config.notches[1].count = 9;
        _private.config.labels = makeLabels(0,8,1);
        _private.config.title = "x1000 RPM";
    }

    if ("timingAdvance" === object.mode) {
        _private.config.min = -60;
        _private.config.max = +60;
        _private.config.notches[0].count = 9;
        _private.config.notches[1].count = 5;
        _private.config.labels = makeLabels(-60,60,30);
        _private.config.title = "\xb0 Timing Advance";
    }

    if ("temperature" === object.mode) {
        _private.config.min = -40;
        _private.config.max = 210;
        _private.config.notches[0].count = 21;
        _private.config.notches[1].count = 6;
        _private.config.labels = makeLabels(-40,210,50);
        _private.config.title = "\xb0C";
    }

    if ("percentage" === object.mode) {
        _private.config.min = 0;
        _private.config.max = 100;
        _private.config.notches[0].count = 51;
        _private.config.notches[1].count = 11;
        _private.config.labels = makeLabels(0,100,10);
        _private.config.title = "%";
    }

    if ("oxygenSensor" === object.mode) {
        _private.config.min = -100;
        _private.config.max = +100;
        _private.config.notches[0].count = 21;
        _private.config.notches[1].count = 5;
        _private.config.labels = makeLabels(-100,100,50);
        _private.config.labels[0] = "Lean";
        _private.config.labels[4] = "Rich";
        _private.config.title = "% Fuel Trim";
    }

    if (object.title) {
        _private.config.title += " " + object.title;
    }

    if (object.position === "full") {
        // do nothing.
    } else if (object.position === "top") {
        _private.config.cy += 60;
        _private.config.angle = [Math.PI + Math.PI/6,2*Math.PI - Math.PI/6];
        _private.config.titleRadius = 115;
    } else if (object.position === "left") {
        _private.config.cx += 60;
        _private.config.angle = [Math.PI * (1/2 + 1/6), Math.PI * (1 + 2/6)];
    } else if (object.position === "right") {
        _private.config.cx -= 60;
        _private.config.angle = [Math.PI * (2/6), Math.PI * (-2/6)];
    }

    _private.value = undefined;

    Object.defineProperty(object,"value",{
        get: function() {
            return _private.value;
        }.$bind(object),
        set: function(val) {
            _private.targetValue = val;
            if (_private.value !== val) {
                _private.animate();
            }
        }.$bind(object)
    });

    $ui_CoreTile.call(this, object, screen);
    $ui.addClass(object.dom,'ui-tile-realtimegauge');

    function makeCanvas() {
        var toReturn = document.createElement("canvas");
        toReturn.width = _private.config.width;
        toReturn.height = _private.config.height;
        $ui.addClass(toReturn,'ui-tile-realtimegauge-canvas');
        object.dom.contentDiv.appendChild(toReturn);
        return toReturn;
    }

    _private.animate = function() {
        if (_private.targetValue === undefined) {
            _private.value = undefined;
            _private.renderNeedle();
            _private.renderValueLabel();
            return;
        }
        if (_private.value === undefined && _private.targetValue !== undefined) {
            _private.value = _private.targetValue;
        }
        if (_private.config.min < 0) {
            var x = 8;
            x *= 56;
            // good spot for a breakpoint.
        }
        var range = _private.config.max - _private.config.min;
        var delta = _private.targetValue - _private.value;
        var frac = delta / range;
        var absFrac = Math.abs(frac);
        var mult = frac < 0 ? -1 : 1;

        if (absFrac < 0.01) {
            // finish the animation
            _private.value = _private.targetValue;
            _private.lastAnimationTime = null;
            _private.renderNeedle();
            _private.renderValueLabel();
            return;
        }

        if (_private.lastAnimationTime == null) {
            _private.lastAnimationTime = new Date().getTime();
        }

        var now = new Date().getTime();
        var deltaTime = now - _private.lastAnimationTime;
        _private.lastAnimationTime = now;

        var maxSpeed = 0.0005;

        var toAdd = mult * maxSpeed * range * deltaTime;
        if (mult * toAdd > mult * delta) {
            toAdd = delta;
        }
        _private.value += toAdd;
        _private.renderNeedle();
        _private.renderValueLabel();
        window.setTimeout(_private.animate,20);
    }.$bind(object);

    _private.needleCanvas = makeCanvas();
    _private.needleCanvasContext = _private.needleCanvas.getContext("2d");

    _private.rulerCanvas = makeCanvas();
    _private.rulerCanvasContext = _private.rulerCanvas.getContext("2d");
    $ui.addClass(_private.rulerCanvas,'ui-tile-realtimegauge-ruler');

    _private.labelCanvas = makeCanvas();
    _private.labelCanvasContext = _private.labelCanvas.getContext("2d");

    object.showContent(true);

    _private.drawNotches = function(notch) {
        var cx = _private.config.cx;
        var cy = _private.config.cy;

        var r1 = notch.r1;
        var r2 = notch.r2;

        var a1 = _private.config.angle[0];
        var a2 = _private.config.angle[1];

        var ctx = _private.rulerCanvasContext;
        ctx.beginPath();
        ctx.strokeStyle = notch.style;
        ctx.lineWidth = notch.width;

        var delta = (a2 -a1) / (notch.count-1);
        for (var i=0; i < notch.count; ++i) {
            var angle = a1 + delta * i;
            var s = Math.sin(angle);
            var c = Math.cos(angle);
            ctx.moveTo(cx + c * r1, cy + s * r1);
            ctx.lineTo(cx + c * r2, cy + s * r2);            // console.log("Line...");
        }

        ctx.stroke();
    }.$bind(object);

    _private.drawArc = function(ctx,style,capStyle,width, cx, cy, r, a1, a2) {
        ctx.strokeStyle = style;
        ctx.lineCap = capStyle;
        ctx.lineWidth = width;
        ctx.beginPath();
        if (a1 < a2) {
            ctx.arc(cx,cy,r,a1,a2);
        } else {
            ctx.arc(cx,cy,r,a2,a1);
        }
        ctx.stroke();
    }.$bind(object);

    _private.drawLabels = function() {
        var ctx = _private.rulerCanvasContext;

        ctx.font = "30px Calibri";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign="center";
        ctx.textBaseline = "middle";

        var a1 = _private.config.angle[0];
        var a2 = _private.config.angle[1];

        var cx = _private.config.cx;
        var cy = _private.config.cy;

        var r = _private.config.labelRadius;

        var delta = (a2 -a1) / (_private.config.labels.length - 1);
        for (var i=0; i< _private.config.labels.length; ++i) {
            var angle = a1 + delta * i;
            var s = Math.sin(angle);
            var c = Math.cos(angle);
            ctx.fillText(_private.config.labels[i],cx + c * r, cy + s * r);
            // console.log(labels[i],cx +c * r, cy + s * r);
        }

    }.$bind(object);

    _private.renderNeedle = function() {
        var ctx = _private.needleCanvasContext;
        if (_private.value === undefined) {
            ctx.clearRect(0, 0, _private.needleCanvas.width, _private.needleCanvas.height);
            return;
        }


        var a1 = _private.config.angle[0];
        var a2 = _private.config.angle[1];

        var width = _private.config.needle.width;
        var r = _private.config.needle.radius;

        var cx = _private.config.cx;
        var cy = _private.config.cy;

        var range = a2 - a1;
        var valueRange = _private.config.max - _private.config.min;
        var valuePosition = (_private.value - _private.config.min) / valueRange;

        if (valuePosition > 1) {
            valuePosition = 1;
        }
        if (valuePosition < 0) {
            valuePosition = 0;
        }
        ctx.clearRect(0, 0, _private.needleCanvas.width, _private.needleCanvas.height);

        _private.drawArc(ctx,$ui.theme.chart.color_GREAT,"butt",width,cx,cy,r,a1,a1 + valuePosition * range);
    }.$bind(object);

    function hexColorToRGBA(color,alpha) {
        var originalColor = color;
        if (color[0]=='#') {
            color = color.substring(1);
        }
        if (color.length!=6) {
            return originColor;
        }

        var colorInt = parseInt(color,16);
        var toReturn = "rgba(" + (colorInt >> 16) + "," + ((colorInt >> 8) & 0xff) + "," + (colorInt & 0xff) + "," + alpha + ")";
        console.log(toReturn);
        return toReturn;
    }

    _private.renderValueLabel = function() {
        if (_private.value === undefined) {
            var ctx = _private.labelCanvasContext;
            ctx.clearRect(0, 0, 400,400);
            return;
        }
        var newLabel = Math.floor(_private.value);
        if (newLabel !== _private.lastValueLabel) {
            _private.lastValueLabel = newLabel;
            var ctx = _private.labelCanvasContext;

            var cx = _private.config.cx;
            var cy = _private.config.cy;

            ctx.clearRect(0, 0, 400,400);
            ctx.textAlign="center";
            ctx.textBaseline = "middle";
            ctx.fillStyle='#ffffff';
            ctx.font = "90px Calibri";
            ctx.fillText(newLabel,cx,cy);
        }
    }.$bind(object);

    _private.renderChrome = function() {
        var outer = $ui.theme.chart.color;
        var color = $ui.theme.chart.color_GREAT;

        for (var i=0; i<_private.config.notches.length; ++i) {
            _private.drawNotches(_private.config.notches[i]);
        }

        _private.drawLabels();

        var cx = _private.config.cx;
        var cy = _private.config.cy;
        var width = _private.config.outer.width;
        var r = _private.config.outer.radius;
        var a1 = _private.config.angle[0];
        var a2 = _private.config.angle[1];
        var titleR = _private.config.titleRadius;

        _private.drawArc(_private.rulerCanvasContext,outer,"round",width,cx,cy,r,a1,a2);

        var ctx = _private.rulerCanvasContext;
        ctx.font = "30px Calibri";
        ctx.fillStyle='#ffffff';
        ctx.fillText(_private.config.title,cx,cy + titleR);

        _private.renderValueLabel();
    }.$bind(object);

    _private.render = function() {
        _private.renderNeedle();
        _private.renderChrome();
    }

    object._onthemechange = function() {
        _private.render();
    }.$bind(object);

    _private.render();

    if (object.pid !== undefined) {
        if (object.pidMode === undefined) {
            object.pidMode = 1;
        }

        var mode = object.pidMode;
        var pid = object.pid;
        OBDWorker.register(mode,pid,function(val) {
            this.value = val;
        }.$bind(object),function() {
            console.log("Error...");
        }.$bind(object));
    }

    // window.setInterval(function() { 
    //     var range = _private.config.max - _private.config.min;
    //     this.value = Math.random() * range + _private.config.min;
    // }.$bind(object),1000);

    return object.dom;
}

$ui.addExtension(new UIExtension('RealTimeGauge', emulator_RealTimeGauge));
