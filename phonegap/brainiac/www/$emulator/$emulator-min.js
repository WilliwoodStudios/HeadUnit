/* $emulator VERSION: 1.0.0.2654*/

function emulator_AppContainer(e,o){return $ui_CoreScreen.call(this,e,o),e?($ui.addClass(e.dom,"emulator-app-container"),e.dom.style.width=void 0==e.width?window.innerWidth+"px":e.width+"px",e.dom.contentDiv=document.createElement("div"),$ui.addClass(e.dom.contentDiv,"inner"),e.dom.appendChild(e.dom.contentDiv),e.iconSplash&&(e.dom.contentDiv.style.backgroundImage='url("'+e.iconSplash+'")'),e._delayedVisibility=function(){this.dom.iframe.style.visibility="visible"},e._delayedVisibility=e._delayedVisibility.bind(e),e._iframeLoad=function(){setTimeout(this._delayedVisibility,500)},e._iframeLoad=e._iframeLoad.bind(e),e.dom.iframe=document.createElement("iframe"),e.dom.contentDiv.appendChild(e.dom.iframe),e.dom.iframe.onload=e._iframeLoad,e._initialize=function(){this.dom.iframe.src=this.src},e._initialize=e._initialize.bind(e),e.dom):void 0}function emulator_CoreWedgeScreen(e,o){if(e&&(e.disableAnimation=!0,e.background=void 0),$ui_CoreScreen.call(this,e,o),e){$ui.addClass(e.dom,"emulator-core-wedge-screen"),e.dom.style.backgroundColor="transparent",window.innerHeight>window.innerWidth&&$ui.addClass(e.dom,"portrait"),void 0==e.direction&&(e.direction="left"),e._isRightToLeft="right"==e.direction?!0:!1,e.dom.wedge=document.createElement("div"),$ui.addClass(e.dom.wedge,"wedge"),e.dom.appendChild(e.dom.wedge);var t=window.innerWidth>window.innerHeight?Math.floor(window.innerWidth/3):Math.floor(window.innerHeight/3),i=Math.floor(t/2),n=20,d=window.innerHeight,a=window.innerWidth,r=Math.sqrt(Math.pow(d,2)+Math.pow(a,2)),s=90-Math.asin(d/r)*(180/Math.PI);return e._degrees=s,e.dom.wedge.style.width=t+"px",e.dom.wedge.style.backgroundColor=$ui.config.brandColor,1==e._isRightToLeft?(s="-"+s,e.dom.wedge.style.right=window.innerWidth>window.innerHeight?Math.floor(t/2)+"px":"-"+Math.floor(t/1.5)+"px"):e.dom.wedge.style.left=window.innerWidth>window.innerHeight?Math.floor(t/2)+"px":"-"+Math.floor(t/1.5)+"px",e.dom.wedge.style["-webkit-transform"]="rotate("+s+"deg)",e.dom.back=document.createElement("div"),$ui.addClass(e.dom.back,"back"),e.dom.appendChild(e.dom.back),e.dom.back.style.bottom="-"+i+"px",e.dom.back.style.width=i+"px",e.dom.back.style.height=i+"px",e.dom.back.style.borderRadius=Math.floor(i/2)+1+"px",e.dom.back.textDiv=document.createElement("div"),$ui.addClass(e.dom.back.textDiv,"back-text"),e.dom.back.appendChild(e.dom.back.textDiv),1==e._isRightToLeft?(e.dom.back.style.right=window.innerWidth>window.innerHeight?Math.floor(i/3)+"px":"20px",$ui.addClass(e.dom.back.textDiv,"right-to-left")):e.dom.back.style.left=window.innerWidth>window.innerHeight?Math.floor(i/3)+"px":"20px",e.dom.back.textDiv.textContent=e.backButton&&e.backButton.caption?e.backButton.caption:"Back",e.backButton&&e.backButton.icon?$ui.addClass(e.dom.back,e.backButton.icon):$ui.addClass(e.dom.back,"emulator-icon-back-white"),e.dom.back.onclick=function(){$ui.playTouchSound(),$ui.pop()},e.dom.back.ontouchstart=function(){this.style.backgroundColor="rgba(0,0,0,0.3)"},e.dom.back.ontouchend=function(){this.style.backgroundColor=""},e.dom.back.ontouchcancel=e.dom.back.ontouchend,$ui.isMobileDevice()||(e.dom.back.onmousedown=e.dom.back.ontouchstart,e.dom.back.onmouseup=e.dom.back.ontouchend,e.dom.back.onmouseleave=e.dom.back.ontouchend),window.setTimeout(function(){e.dom.wedge.style.opacity="1.0"},0),window.setTimeout(function(){e.dom.back.style.transform="translateY(-"+(i+n)+"px)",e.dom.back.addEventListener("webkitTransitionEnd",function(){this.textDiv.style.opacity="1.0"},!1)},200),e.dom}}function emulator_HeadUnitChrome(e){if($ui_CoreScreen.call(this,e),e){$ui.addClass(e.dom,"emulator-head-unit-chrome"),e.isDualView=window.innerHeight>window.innerWidth,1==e.isDualView&&$ui.addClass(e.dom,"portrait"),e._recalculateLayout=function(){this.hvac&&1==this.hvac.visible&&(0==this.isDualView?this._primaryWindow.dom.style.bottom=this.hvac._getHeight()+"px":this._secondaryWindow&&(this._secondaryWindow.dom.style.bottom=this.hvac._getHeight()+"px"))},e._recalculateLayout=e._recalculateLayout.bind(e),e._primaryWindow={parent:e};var o=new emulator_Window(e._primaryWindow,e);if($ui.addClass(o,"primary"),o.style.borderBottomColor=$ui.config.brandColor,e.dom.appendChild(o),1==e.isDualView&&(e._secondaryWindow={parent:e},o=new emulator_Window(e._secondaryWindow,e),$ui.addClass(o,"secondary"),e.dom.appendChild(o)),e._navigation={},e._navigation._chrome=e,o=new emulator_NavigationBar(e._navigation,e),e.dom.appendChild(o),e.hvac&&(o=new emulator_HVACBar(e.hvac,e),e.dom.appendChild(o)),e.homeWindowPane&&setTimeout(function(){e._primaryWindow.push(e.homeWindowPane)},0),e.secondaryWindowPane&&1==e.isDualView){var t=function(){this.component=$ui.AppContainer,this.disableAnimation=!0};t.prototype.src=e.secondaryWindowPane,setTimeout(function(){t.prototype.width=e._secondaryWindow.dom.offsetWidth,e._secondaryWindow.push(t)},0)}return e._setNavigationMenu=e._navigation._setNavigationMenu,e.dom}}function emulator_DefrostButton(e,o){return $ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"defrost-button"),$ui.addClass(e.dom,"off"),e.dom.style.backgroundColor=$ui.config.brandColor,e.dom.onclick=function(){$ui.playTouchSound()},e.dom.ontouchstart=function(){$ui.addClass(this,"selected")},e.dom.ontouchend=function(){$ui.removeClass(this,"selected")},e.dom.ontouchcancel=e.dom.ontouchend,$ui.isMobileDevice()||(e.dom.onmousedown=e.dom.ontouchstart,e.dom.onmouseup=e.dom.ontouchend,e.dom.onmouseleave=e.dom.ontouchend),e.dom}function emulator_FansButton(e,o){return $ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"fans"),e.dom.style.backgroundColor=$ui.config.brandColor,void 0==e.value&&(e.value=$ui.HeadUnitChrome.Fans.AUTO),e.dom.onclick=function(){$ui.playTouchSound(),this.model.onclick&&this.model.onclick()},e.dom.ontouchstart=function(){$ui.addClass(this,"selected")},e.dom.ontouchend=function(){$ui.removeClass(this,"selected")},e.dom.ontouchcancel=e.dom.ontouchend,$ui.isMobileDevice()||(e.dom.onmousedown=e.dom.ontouchstart,e.dom.onmouseup=e.dom.ontouchend,e.dom.onmouseleave=e.dom.ontouchend),e.setValue=function(e){var o=void 0==this.value?$ui.HeadUnitChrome.Fans.AUTO:this.value;void 0==e&&(e=$ui.HeadUnitChrome.Fans.AUTO),this.value=e,$ui.removeClass(this.dom,"emulator-icon-head-unit-fans-setting-"+o),$ui.addClass(this.dom,"emulator-icon-head-unit-fans-setting-"+this.value)},e.setValue=e.setValue.bind(e),void 0!=e.value&&e.setValue(e.value),e._onshow=function(){setTimeout(this._timedOpacity,500)},e._onshow=e._onshow.bind(e),e._timedOpacity=function(){this.dom.style.opacity="1.0"},e._timedOpacity=e._timedOpacity.bind(e),e.dom}function emulator_HVACBar(e,o){$ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"hvac");var t;return e.dom.style.borderTopColor=$ui.config.brandColor,void 0==e.driver?e.driver={temperature:{value:0,side:"left",visible:!1},seat:{value:0,side:"left",visible:!1}}:(void 0==e.driver.temperature&&(e.driver.temperature={value:0,visible:!1}),void 0==e.driver.seat&&(e.driver.seat={value:0,visible:!1}),e.driver.temperature.side="left",e.driver.seat.side="left"),t=new emulator_TemperatureButton(e.driver.temperature,o),e.dom.appendChild(t),t=new emulator_SeatButton(e.driver.seat,o),e.dom.appendChild(t),void 0==e.passenger?e.passenger={temperature:{value:0,side:"right",visible:!1},seat:{value:0,side:"right",visible:!1}}:(void 0==e.passenger.temperature&&(e.passenger.temperature={value:0,visible:!1}),void 0==e.passenger.seat&&(e.passenger.seat={value:0,visible:!1}),e.passenger.temperature.side="right",e.passenger.seat.side="right"),t=new emulator_TemperatureButton(e.passenger.temperature,o),e.dom.appendChild(t),t=new emulator_SeatButton(e.passenger.seat,o),e.dom.appendChild(t),e._rearDefrost=1==e.showDefrostOnBar?{parent:e}:{parent:e,visible:!1},t=new emulator_DefrostButton(e._rearDefrost,o),e.dom.appendChild(t),e.fans?e.fans.parent=e:e.fans={parent:e,visible:!1},t=new emulator_FansButton(e.fans,o),e.dom.appendChild(t),e._getHeight=function(){return 120},e._getHeight=e._getHeight.bind(e),e._setVisible=function(){this.screen._recalculateLayout()},e._setVisible=e._setVisible.bind(e),e._setVisible(e.visible),e.dom}function emulator_SeatButton(e,o){return $ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"seat"),e.dom.style.backgroundColor=$ui.config.brandColor,void 0!=e.side&&$ui.addClass(e.dom,e.side),void 0==e.maxLevel&&(e.maxLevel=0),e.dom.onclick=function(){this.model.level==this.model.maxLevel?this.model.setLevel(0):this.model.setLevel(this.model.level+1),$ui.playTouchSound(),this.model.onclick&&this.model.onclick()},e.dom.ontouchstart=function(){$ui.addClass(this,"selected")},e.dom.ontouchend=function(){$ui.removeClass(this,"selected")},e.dom.ontouchcancel=e.dom.ontouchend,$ui.isMobileDevice()||(e.dom.onmousedown=e.dom.ontouchstart,e.dom.onmouseup=e.dom.ontouchend,e.dom.onmouseleave=e.dom.ontouchend),e.setLevel=function(e){var o=void 0==this.level?0:this.level;void 0==e&&(e=0),this.level=e,$ui.removeClass(this.dom,"level-"+o),$ui.addClass(this.dom,"level-"+this.level)},e.setLevel=e.setLevel.bind(e),void 0!=e.level&&e.setLevel(e.level),e._onshow=function(){setTimeout(this._timedOpacity,500)},e._onshow=e._onshow.bind(e),e._timedOpacity=function(){this.dom.style.opacity="1.0"},e._timedOpacity=e._timedOpacity.bind(e),e.dom}function emulator_TemperatureButton(e,o){return $ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"temperature"),e.dom.style.color=$ui.config.brandColor,void 0!=e.side&&$ui.addClass(e.dom,e.side),e.dom.onclick=function(){$ui.playTouchSound(),this.model.onclick&&this.model.onclick()},e.dom.ontouchstart=function(){this.style.backgroundColor=$ui.config.brandColor,this.style.color="white"},e.dom.ontouchend=function(){this.style.backgroundColor="",this.style.color=$ui.config.brandColor},e.dom.ontouchcancel=e.dom.ontouchend,$ui.isMobileDevice()||(e.dom.onmousedown=e.dom.ontouchstart,e.dom.onmouseup=e.dom.ontouchend,e.dom.onmouseleave=e.dom.ontouchend),e.setTemperature=function(e){this.value=e;var o=1==$ui.config.celsius?"C":"F";this.dom.innerHTML=e+'<span class="small">&deg;'+o+"</span>"},e.setTemperature=e.setTemperature.bind(e),e.value&&e.setTemperature(e.value),e.dom}function emulator_NavigationBar(e,o){return $ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"navigation"),e.dom.style.borderRightColor=$ui.config.brandColor,e.dom.style.borderBottomColor=$ui.config.brandColor,e.dom.clock=document.createElement("div"),$ui.addClass(e.dom.clock,"clock"),e.dom.clock.style.color=$ui.config.brandColor,e.dom.appendChild(e.dom.clock),e._updateClock=function(){var e=new Date,o=e.getHours(),t=e.getMinutes();o=o>12?o-12:o,t=10>t?"0"+t:t,this.dom.clock.textContent=o+":"+t},e._updateClock=e._updateClock.bind(e),window.setInterval(e._updateClock,1e4),e._updateClock(),e.dom.homeLine=document.createElement("div"),$ui.addClass(e.dom.homeLine,"line"),$ui.addClass(e.dom.homeLine,"home"),e.dom.appendChild(e.dom.homeLine),e.dom.centerLine=document.createElement("div"),$ui.addClass(e.dom.centerLine,"line"),$ui.addClass(e.dom.centerLine,"center"),e.dom.appendChild(e.dom.centerLine),e.dom.moreLine=document.createElement("div"),$ui.addClass(e.dom.moreLine,"line"),$ui.addClass(e.dom.moreLine,"more"),e.dom.appendChild(e.dom.moreLine),e.dom.dot=document.createElement("div"),$ui.addClass(e.dom.dot,"dot"),e.dom.dot.style.backgroundColor=$ui.config.brandColor,e.dom.appendChild(e.dom.dot),e.dom.homeBtn=document.createElement("div"),e.dom.homeBtn.model=e,e._selectedButton=e.dom.homeBtn,$ui.addClass(e.dom.homeBtn,"circle-button"),$ui.addClass(e.dom.homeBtn,"home"),e.dom.appendChild(e.dom.homeBtn),e.dom.homeBtn.onclick=function(){this.model._selectedButton!=this&&(this.model._selectedButton=this,this.model.dom.dot.style["-webkit-transform"]=this.model._chrome.isDualView?"translateX(0px)":"translateY(0px)",this.model.dom.centerBtn._hide(),this.model._chrome._primaryWindow.popToHome(),$ui.playTouchSound())},e.dom.centerBtn=document.createElement("div"),e.dom.centerBtn.model=e,e.dom.centerBtn._hidden=!0,$ui.addClass(e.dom.centerBtn,"circle-button"),$ui.addClass(e.dom.centerBtn,"center"),e.dom.appendChild(e.dom.centerBtn),e.dom.centerBtn.onclick=function(){this._hidden!==!0&&this.model._selectedButton!=this&&(this.model._selectedButton=this,this.model.dom.dot.style["-webkit-transform"]=this.model._chrome.isDualView?"translateX("+(this.offsetLeft-this.model.dom.homeBtn.offsetLeft)+"px)":"translateY("+(this.offsetTop-this.model.dom.homeBtn.offsetTop)+"px)",$ui.playTouchSound())},e.dom.centerBtn._hide=function(){this.model.dom.centerBtn.style.opacity="0",this.model.dom.centerLine.style.opacity="1.0",this._hidden=!0},e.dom.centerBtn._hide=e.dom.centerBtn._hide.bind(e.dom.centerBtn),e.dom.centerBtn._show=function(){this.model.dom.centerBtn.style.opacity="1.0",this.model.dom.centerLine.style.opacity="0",this._hidden=!1},e.dom.centerBtn._show=e.dom.centerBtn._show.bind(e.dom.centerBtn),e.dom.moreBtn=document.createElement("div"),e.dom.moreBtn.model=e,$ui.addClass(e.dom.moreBtn,"circle-button"),$ui.addClass(e.dom.moreBtn,"more"),e.dom.appendChild(e.dom.moreBtn),e.dom.moreBtn.onclick=function(){this.model._selectedButton!=this&&(this.model._selectedButton=this,this.model.dom.dot.style["-webkit-transform"]=this.model._chrome.isDualView?"translateX("+(this.offsetLeft-this.model.dom.homeBtn.offsetLeft)+"px)":"translateY("+(this.offsetTop-this.model.dom.homeBtn.offsetTop)+"px)",$ui.playTouchSound())},e._recalculateLayout=function(){if(this._chrome.isDualView){var e,o=this.dom.homeBtn.offsetLeft+this.dom.homeBtn.offsetWidth,t=this.dom.moreBtn.offsetLeft,i=Math.floor((t-o)/2);e=t-i-Math.floor(this.dom.centerBtn.offsetWidth/2),this.dom.centerBtn.style.left=e+"px",this.dom.homeLine.style.width=e-o+2+"px",this.dom.moreLine.style.width=t-e-this.dom.centerBtn.offsetHeight+2+"px",this.dom.dot.style["-webkit-transform"]="translateX("+(this._selectedButton.offsetLeft-this.dom.homeBtn.offsetLeft)+"px)"}else{var n,d=this.dom.homeBtn.offsetTop+this.dom.homeBtn.offsetHeight,a=this.dom.moreBtn.offsetTop,i=Math.floor((a-d)/2);n=a-i-Math.floor(this.dom.centerBtn.offsetHeight/2),this.dom.centerBtn.style.top=n+"px",this.dom.homeLine.style.height=n-d+"px",this.dom.moreLine.style.height=a-n-this.dom.centerBtn.offsetHeight+"px",this.dom.dot.style["-webkit-transform"]="translateY("+(this._selectedButton.offsetTop-this.dom.homeBtn.offsetTop)+"px)"}},e._recalculateLayout=e._recalculateLayout.bind(e),e._onresize=function(){this._recalculateLayout()},e._onresize=e._onresize.bind(e),e._getHeight=function(){return window.innerHeight>window.innerWidth?126:150},e._getHeight=e._getHeight.bind(e),e._setNavigationMenu=function(e){this.dom.centerBtn._appContainer!=e&&(this.dom.centerBtn._hidden=!1,this.dom.centerBtn.style.opacity="1.0",this.dom.centerBtn._appContainer=e,this.dom.centerBtn.style.backgroundImage='url("'+e.icon+'")',this.dom.centerLine.style.opacity="0",this._selectedButton=this.dom.centerBtn,this.dom.dot.style["-webkit-transform"]=this._chrome.isDualView?"translateX("+(this.dom.centerBtn.offsetLeft-this.dom.homeBtn.offsetLeft)+"px)":"translateY("+(this.dom.centerBtn.offsetTop-this.dom.homeBtn.offsetTop)+"px)")},e._setNavigationMenu=e._setNavigationMenu.bind(e),setTimeout(e._recalculateLayout,0),e.dom}function emulator_WedgeTemperature(e,o){emulator_CoreWedgeScreen.call(this,e,o),$ui.addClass(e.dom,"emulator-wedge-temperature"),e._max=85,e._min=55,e.dom.box=document.createElement("div"),$ui.addClass(e.dom.box,"box"),e.dom.wedge.appendChild(e.dom.box);var t,i=e._degrees;return 1!=e._isRightToLeft&&(i="-"+i),e.dom.box.style["-webkit-transform"]="rotate("+i+"deg)",e._increaseTemperature=function(){this.temperature<this._max&&(this.setTemperature(this.temperature+1),this.onchange&&this.onchange())},e._increaseTemperature=e._increaseTemperature.bind(e),e._decreaseTemperature=function(){this.temperature>this._min&&(this.setTemperature(this.temperature-1),this.onchange&&this.onchange())},e._decreaseTemperature=e._decreaseTemperature.bind(e),e._upButton={direction:"up",onclick:e._increaseTemperature},t=new emulator_WedgeTemperatureButton(e._upButton,e),e.dom.box.appendChild(t),e._downButton={direction:"down",onclick:e._decreaseTemperature},t=new emulator_WedgeTemperatureButton(e._downButton,e),e.dom.box.appendChild(t),e.dom.temperature=document.createElement("div"),$ui.addClass(e.dom.temperature,"temperature"),e.dom.box.appendChild(e.dom.temperature),e.setTemperature=function(e){this.temperature=e,this.dom.temperature.textContent=e},e.setTemperature=e.setTemperature.bind(e),e.temperature&&e.setTemperature(e.temperature),e.dom}function emulator_WedgeTemperatureButton(e,o){return $ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"button"),void 0!=e.direction?$ui.addClass(e.dom,e.direction):$ui.addClass(e.dom,"up"),e.dom.arrow=document.createElement("div"),$ui.addClass(e.dom.arrow,"arrow"),e.dom.appendChild(e.dom.arrow),e.dom.onclick=function(){$ui.playTouchSound(),this.model.onclick&&this.model.onclick()},e.dom.ontouchstart=function(){this.style.opacity="0.5"},e.dom.ontouchend=function(){this.style.opacity=""},e.dom.ontouchcancel=e.dom.ontouchend,$ui.isMobileDevice()||(e.dom.onmousedown=e.dom.ontouchstart,e.dom.onmouseup=e.dom.ontouchend,e.dom.onmouseleave=e.dom.ontouchend),e.dom}function emulator_Window(e,o){return $ui_CoreComponent.call(this,e,o),$ui.addClass(e.dom,"emulator-window"),e.screens=[],e.push=function(e,o){if(e=new e,e.container=this,e.chrome=this.parent,e.width||(e.width=this.dom.offsetWidth),e.component==$ui.AppContainer)var t=new emulator_AppContainer(e,o);else{if(e.component!=$ui.WindowPane)return;var t=new $ui_WindowPane(e,o)}this.screens.push(e),e.icon&&this.screen._setNavigationMenu(e),this.dom.appendChild(t),e.disableAnimation===!0&&e.initialize()},e.push=e.push.bind(e),e.popToHome=function(){if(!(1>=this.screens.length)){if($ui.inScreenTransition=!0,$ui.blockAllTapEvent(!0),this.screens[0].dom.style.visibility="",this.screens.length>1){var e=this.screens[this.screens.length-1];e._onbeforepop&&e._onbeforepop(),$ui.eventBroker.removeEventListenersForScreen(e)}setTimeout(this._popToHome,0)}},e.popToHome=e.popToHome.bind(e),e._popToHome=function(){if(!(1>=this.screens.length)){var e,o;for(o=this.screens[this.screens.length-1],o.disableAnimation===!0?(this._removeScreen(o),$ui.inScreenTransition=!1,$ui.blockAllTapEvent(!1)):(o.dom.style["-webkit-animation-delay"]="",o.dom.style["-webkit-animation-name"]="ui-pane-slide-right",o.dom.addEventListener("webkitAnimationEnd",function(){this.model.container._removeScreen(this.model),$ui.inScreenTransition=!1,$ui.blockAllTapEvent(!1)},!1)),e=this.screens.length-2;e>0;e--)this._removeScreen(this.screens[e])}},e._popToHome=e._popToHome.bind(e),e.pop=function(){if(!(1>=this.screens.length)){$ui.inScreenTransition=!0,$ui.blockAllTapEvent(!0);var e=this.screens[this.screens.length-2];if(e.dom.style.visibility="",e.menuImgClass&&this.screen._setNavigationMenu(e),this.screens.length>1){var o=this.screens[this.screens.length-1];o._onbeforepop&&o._onbeforepop(),o.disableAnimation===!0?(this._removeScreen(o),$ui.inScreenTransition=!1,$ui.blockAllTapEvent(!1)):(o.dom.style["-webkit-animation-delay"]="",o.dom.style["-webkit-animation-name"]="pane-slide-right",o.dom.addEventListener("webkitAnimationEnd",function(){this.model.container._removeScreen(this.model),$ui.inScreenTransition=!1,$ui.blockAllTapEvent(!1)},!1))}}},e.pop=e.pop.bind(e),e._removeScreen=function(e){e.dom.style.display="none",this.dom.removeChild(e.dom),$ui.eventBroker.removeEventListenersForScreen(e),e.destroy(),this.screens.pop()},e._removeScreen=e._removeScreen.bind(e),e._resizeListener=function(){var e,o;for(e=0;this.screens.length>e;e++)o=this.screens[e],o._onresize&&o._onresize(),o._onwindowpaneresize&&o._onwindowpaneresize(),o.onresize&&o.onresize()},e._resizeListener=e._resizeListener.bind(e),window.addEventListener("resize",e._resizeListener,!1),e.dom}var $emulator={config:{inHeadUnit:!1,brandColor:"#D94646",tileFontColor:"#747474",celsius:!1,audioManager:void 0},init:function(e,o){$emulator.chrome=e,this.config.inHeadUnit=o.inHeadUnit?o.inHeadUnit:this.config.inHeadUnit,this.config.brandColor=o.brandColor?o.brandColor:this.config.brandColor,this.config.tileFontColor=o.tileFontColor?o.tileFontColor:this.config.tileFontColor,this.config.audioManager=o.audioManager?o.audioManager:this.config.audioManger,$ui.addExtension({name:"HeadUnitChrome",definition:{Fans:{AUTO:0}},type:$ui.ExtensionType.SCREEN,constructor:emulator_HeadUnitChrome}),$ui.addExtension({name:"WedgeTemperature",definition:{RIGHT:"right",LEFT:"left"},type:$ui.ExtensionType.SCREEN,constructor:emulator_WedgeTemperature}),$ui.addExtension({name:"AppContainer",definition:{},type:$ui.ExtensionType.SCREEN,constructor:emulator_AppContainer})},openApp:function(e){if(0!=$ui.screens.length){var o=new XMLHttpRequest,t="apps/"+e+"/manifest.json";o.chrome=$ui.screens[0],o.identifier=e,o.onreadystatechange=function(){if(4==this.readyState&&200==this.status){try{var e="apps/"+this.identifier+"/",o=JSON.parse(this.responseText)}catch(t){return console.log("JSON Parsing Error: "+t+" : "+this.identifier),void 0}if(void 0==o.content)return console.log('Undefined "content" for manifest: '+this.identifier),void 0;var i=function(){this.component=$ui.AppContainer};i.prototype.src=e+o.content,o.icon&&(i.prototype.icon=e+o.icon),o.iconSplash&&(i.prototype.iconSplash=e+o.iconSplash),this.chrome._primaryWindow.push(i)}},o.open("GET",t,!0),o.send()}}};emulator_AppContainer.prototype=new $ui_CoreScreen,emulator_CoreWedgeScreen.prototype=new $ui_CoreScreen,emulator_HeadUnitChrome.prototype=new $ui_CoreScreen,emulator_DefrostButton.prototype=new $ui_CoreComponent,emulator_FansButton.prototype=new $ui_CoreComponent,emulator_HVACBar.prototype=new $ui_CoreComponent,emulator_SeatButton.prototype=new $ui_CoreComponent,emulator_TemperatureButton.prototype=new $ui_CoreComponent,emulator_NavigationBar.prototype=new $ui_CoreComponent,emulator_WedgeTemperature.prototype=new emulator_CoreWedgeScreen,emulator_WedgeTemperatureButton.prototype=new $ui_CoreComponent,emulator_Window.prototype=new $ui_CoreComponent;