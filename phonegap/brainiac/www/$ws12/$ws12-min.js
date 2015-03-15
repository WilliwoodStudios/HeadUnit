/* $ws12 VERSION: 1.0.0.19*/

function ws12_BrowserButton(t,o){return $ui_CoreComponent.call(this,t,o),$ui.addClass(t.dom,"button"),t.style&&$ui.addClass(t.dom,t.style),t.dom.onclick=function(){this.model.enabled!==!1&&($ui.playTouchSound(),this.model.onclick&&this.model.onclick())},t.dom.ontouchstart=function(){this.model.enabled!==!1&&(this.style.backgroundColor=$ui.config.brandColor)},t.dom.ontouchend=function(){this.model.enabled!==!1&&(this.style.backgroundColor="")},t.dom.ontouchcancel=t.dom.ontouchend,$ui.isMobileDevice()||(t.dom.onmousedown=t.dom.ontouchstart,t.dom.onmouseup=t.dom.ontouchend),t.setStyle=function(t){t!=this.style&&(void 0!=this.style&&$ui.removeClass(this.dom,this.style),$ui.addClass(this.dom,t),this.style=t)},t.setStyle=t.setStyle.bind(t),t.dom}function ws12_Browser(t,o){return $ui_CoreComponent.call(this,t,o),$ui.addClass(t.dom,"ws12-browser"),t._isIFrame=!0,t.dom.chrome=document.createElement("div"),$ui.addClass(t.dom.chrome,"chrome"),t.dom.appendChild(t.dom.chrome),t.dom.chrome.style.borderBottomColor=$ui.config.brandColor,t.dom.inputDiv=document.createElement("div"),$ui.addClass(t.dom.inputDiv,"inputDiv"),t.dom.chrome.appendChild(t.dom.inputDiv),t.dom.inputDiv.style.borderColor=$ui.config.brandColor,t.dom.input=document.createElement("input"),t.dom.input.model=t,t.dom.input.setAttribute("spellcheck","false"),t.dom.inputDiv.appendChild(t.dom.input),t.dom.input.onclick=function(t){30>=this.offsetWidth-t.offsetX&&(this.value="")},t.dom.icon=document.createElement("div"),$ui.addClass(t.dom.icon,"icon"),t.dom.inputDiv.appendChild(t.dom.icon),t.dom.spinner=new $ui_Spinner({component:$ui.Spinner,size:$ui.Spinner.TINY,forceColor:"dark"},o),t.dom.spinner.style.display="none",t.dom.icon.appendChild(t.dom.spinner),t._backBtn={style:"back"},new ws12_BrowserButton(t._backBtn,o),t.dom.chrome.appendChild(t._backBtn.dom),t._nextBtn={style:"next"},new ws12_BrowserButton(t._nextBtn,o),t.dom.chrome.appendChild(t._nextBtn.dom),t._refreshBtn={style:"stop"},new ws12_BrowserButton(t._refreshBtn,o),t.dom.chrome.appendChild(t._refreshBtn.dom),t._newTabBtn={style:"new-tab"},new ws12_BrowserButton(t._newTabBtn,o),t.dom.chrome.appendChild(t._newTabBtn.dom),t._favoriteBtn={style:"favorite"},new ws12_BrowserButton(t._favoriteBtn,o),t.dom.chrome.appendChild(t._favoriteBtn.dom),t._bookmarksBtn={style:"bookmarks"},new ws12_BrowserButton(t._bookmarksBtn,o),t.dom.chrome.appendChild(t._bookmarksBtn.dom),t.dom.browserDiv=document.createElement("div"),$ui.addClass(t.dom.browserDiv,"browserDiv"),t.dom.appendChild(t.dom.browserDiv),t._isIFrame===!0&&(t.dom.iframe=document.createElement("iframe"),t.dom.iframe.model=t,t.dom.iframe.setAttribute("seamless","true"),t.dom.browserDiv.appendChild(t.dom.iframe)),t.setSrc=function(t){t!=this.src&&this._setSrc(t)},t.setSrc=t.setSrc.bind(t),t._setSrc=function(t){this.src=t,this.dom.input.value=t,this.dom.spinner.style.display="",this._refreshBtn.setStyle("stop"),$ui.removeClass(this.dom.icon,"page"),this._isIFrame===!0&&(this.dom.iframe.src=t)},t._setSrc=t._setSrc.bind(t),t._onload=function(){this.dom.spinner.style.display="none",$ui.addClass(this.dom.icon,"page"),this._refreshBtn.setStyle("refresh")},t._onload=t._onload.bind(t),t._onbeforepop=function(){this._isIFrame===!0&&(this.dom.iframe.style.display="none")},t._onbeforepop=t._onbeforepop.bind(t),t._onshow=function(){this.src&&this._setSrc(this.src),this._isIFrame===!0&&(this.dom.iframe.style.display="inline",this.dom.iframe.onload=t._onload)},t._onshow=t._onshow.bind(t),t.dom}function ws12_DialPadButton(t,o){return $ui_CoreComponent.call(this,t,o),$ui.addClass(t.dom,"circle-button"),t.dom.style.borderColor=$ui.config.brandColor,t.dom.captionDiv=document.createElement("div"),$ui.addClass(t.dom.captionDiv,"caption"),t.dom.captionDiv.textContent=t.caption,t.dom.appendChild(t.dom.captionDiv),t.center===!0&&$ui.addClass(t.dom.captionDiv,"centered"),t.dom.letters=document.createElement("div"),$ui.addClass(t.dom.letters,"letters"),t.dom.appendChild(t.dom.letters),t.letters&&(t.dom.letters.textContent=t.letters),t.dom.ontouchstart=function(){this.style.backgroundColor=$ui.config.brandColor},t.dom.ontouchend=function(){this.style.backgroundColor=""},t.dom.ontouchcancel=t.dom.ontouchend,$ui.isMobileDevice()||(t.dom.onmousedown=t.dom.ontouchstart,t.dom.onmouseup=t.dom.ontouchend,t.dom.onmouseleave=t.dom.ontouchend),t.dom.onclick=function(){var t={caption:this.model.caption,letters:this.model.letters};void 0!=this.model.parent&&this.model.parent.onkeypadpress&&this.model.parent.onkeypadpress(t)},t.dom}function ws12_DialPad(t,o){$ui_CoreComponent.call(this,t,o),$ui.addClass(t.dom,"ws12-dial-pad"),t._buttons=[{caption:"1"},{caption:"2",letters:"ABC"},{caption:"3",letters:"DEF"},{caption:"4",letters:"GHI"},{caption:"5",letters:"JKL"},{caption:"6",letters:"MNO"},{caption:"7",letters:"PQRS"},{caption:"8",letters:"TUV"},{caption:"9",letters:"WXYZ"},{caption:"*",center:!0},{caption:"0",letters:"+"},{caption:"#",center:!0}];var e,i,n,d,a,s=0,r=0,l=350,m=500,c=104,u=Math.floor(m/4),p=Math.floor(l/3),h=Math.floor(p/2-c/2),v=Math.floor(u/2-c/2);for(e=0;t._buttons.length>e;e++)i=t._buttons[e],i.parent=t,n=new ws12_DialPadButton(i,o),t.dom.appendChild(n),d=s*u+v,a=r*p+h,n.style.top=d+"px",n.style.left=a+"px",0===(e+1)%3?(s++,r=0):r++;return t.dom}function ws12_Map(t,o){return $ui_CoreComponent.call(this,t,o),$ui.addClass(t.dom,"ws12-map"),t.dom.mapDiv=document.createElement("div"),$ui.addClass(t.dom.mapDiv,"mapDiv"),t.dom.appendChild(t.dom.mapDiv),t.dom.iframe=document.createElement("iframe"),t.dom.mapDiv.appendChild(t.dom.iframe),t._onbeforepop=function(){},t._onbeforepop=t._onbeforepop.bind(t),t._onshow=function(){this.src&&(this.dom.iframe.src=this.src),this.dom.iframe.style.display="inline"},t._onshow=t._onshow.bind(t),t.dom}function ws12_MediaPlayer(t,o){return $ui_CoreComponent.call(this,t,o),$ui.addClass(t.dom,"ws12-media-player"),t.dom.coverArt=document.createElement("div"),$ui.addClass(t.dom.coverArt,"cover-art"),t.dom.appendChild(t.dom.coverArt),t.dom.coverArt.loader=new Image,t.dom.coverArt.loader.model=t,t.dom.coverArt.loader.onload=function(){this.model.dom.coverArt.style.backgroundImage='url("'+this.model.coverArt+'")',this.model.dom.coverArt.style.opacity="0.3"},t.dom.menu=document.createElement("div"),t.dom.menu.model=t,$ui.addClass(t.dom.menu,"menu"),t.dom.appendChild(t.dom.menu),t.dom.menu.onclick=function(){$ui.playTouchSound(),this.model.onmenuclick&&this.model.onmenuclick()},t.dom.menu.ontouchstart=function(){this.style.backgroundColor=$ui.config.brandColor},t.dom.menu.ontouchend=function(){this.style.backgroundColor=""},t.dom.menu.ontouchcancel=t.dom.ontouchend,$ui.isMobileDevice()||(t.dom.menu.onmousedown=t.dom.menu.ontouchstart,t.dom.menu.onmouseup=t.dom.menu.ontouchend,t.dom.menu.onmouseleave=t.dom.menu.ontouchend),t.dom.controls=document.createElement("div"),$ui.addClass(t.dom.controls,"controls"),t.dom.appendChild(t.dom.controls),t.dom.artist=document.createElement("div"),$ui.addClass(t.dom.artist,"artist"),t.dom.controls.appendChild(t.dom.artist),t.dom.song=document.createElement("div"),$ui.addClass(t.dom.song,"song"),t.dom.controls.appendChild(t.dom.song),t.dom.album=document.createElement("div"),$ui.addClass(t.dom.album,"album"),t.dom.controls.appendChild(t.dom.album),t.dom.playbox=document.createElement("div"),$ui.addClass(t.dom.playbox,"playbox"),t.dom.controls.appendChild(t.dom.playbox),t.dom.skipBack=document.createElement("div"),$ui.addClass(t.dom.skipBack,"button"),$ui.addClass(t.dom.skipBack,"skip-back"),t.dom.playbox.appendChild(t.dom.skipBack),t.dom.skipForward=document.createElement("div"),$ui.addClass(t.dom.skipForward,"button"),$ui.addClass(t.dom.skipForward,"skip-forward"),t.dom.playbox.appendChild(t.dom.skipForward),t.dom.play=document.createElement("div"),$ui.addClass(t.dom.play,"button"),$ui.addClass(t.dom.play,"play"),t.dom.playbox.appendChild(t.dom.play),t.dom.textButtonBox=document.createElement("div"),$ui.addClass(t.dom.textButtonBox,"textButtonBox"),t.dom.appendChild(t.dom.textButtonBox),t.dom.buttonRepeat=document.createElement("div"),$ui.addClass(t.dom.buttonRepeat,"text-button"),$ui.addClass(t.dom.buttonRepeat,"left"),t.dom.buttonRepeat.textContent="Repeat Off",t.dom.textButtonBox.appendChild(t.dom.buttonRepeat),t.dom.buttonSource=document.createElement("div"),$ui.addClass(t.dom.buttonSource,"text-button"),$ui.addClass(t.dom.buttonSource,"center"),t.dom.buttonSource.textContent="Source",t.dom.textButtonBox.appendChild(t.dom.buttonSource),t.dom.buttonShuffle=document.createElement("div"),$ui.addClass(t.dom.buttonShuffle,"text-button"),$ui.addClass(t.dom.buttonShuffle,"right"),t.dom.buttonShuffle.textContent="Shuffle Off",t.dom.textButtonBox.appendChild(t.dom.buttonShuffle),t.setAlbum=function(t){this.album=t,this.dom.album.textContent=void 0!=t?t:""},t.setAlbum=t.setAlbum.bind(t),t.setSong=function(t){this.song=t,this.dom.song.textContent=void 0!=t?t:""},t.setSong=t.setSong.bind(t),t.setArtist=function(t){this.artist=t,this.dom.artist.textContent=void 0!=t?t:""},t.setArtist=t.setArtist.bind(t),t.setCoverArt=function(t){this.coverArt=t,this.dom.coverArt.style.opacity="0",void 0!=t&&(this.dom.coverArt.loader.src=t)},t.setCoverArt=t.setCoverArt.bind(t),t._providerUpdate=function(t){this.coverArt=t?t.coverArt:void 0,this.setCoverArt(this.coverArt),this.setArtist(this.artist),this.setSong(this.song),this.setAlbum(this.album)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate(t),t.dom}function ws12_PhoneLogListItem(t,o){return $ui_CoreComponent.call(this,t,o),$ui.addClass(t.dom,"ws12-phone-log-list-item"),void 0==t.style&&(t.style=$ui.PhoneLogListItem.INCOMING),$ui.addClass(t.dom,t.style),t.dom.details=document.createElement("div"),$ui.addClass(t.dom.details,"details"),t.dom.appendChild(t.dom.details),t.dom.titleArea=document.createElement("div"),$ui.addClass(t.dom.titleArea,"title"),t.dom.titleArea.textContent=t.title,t.dom.details.appendChild(t.dom.titleArea),t.style===$ui.PhoneLogListItem.MISSED&&(t.dom.titleArea.style.color=$ui.config.brandColor),t.dom.captionDiv=document.createElement("div"),$ui.addClass(t.dom.captionDiv,"caption"),t.dom.captionDiv.style.color=$ui.config.brandColor,t.dom.details.appendChild(t.dom.captionDiv),t.caption?t.dom.captionDiv.textContent=t.caption:$ui.addClass(t.dom,"no-caption"),t.dom.ontouchstart=function(){this.style.backgroundColor=$ui.config.brandColor},t.dom.ontouchend=function(){this.style.backgroundColor=""},t.dom.ontouchcancel=t.dom.ontouchend,$ui.isMobileDevice()||(t.dom.onmousedown=t.dom.ontouchstart,t.dom.onmouseup=t.dom.ontouchend,t.dom.onmouseleave=t.dom.ontouchend),t.dom.addEventListener("click",function(){if(void 0!=this.model.parent.onaction){var t=new $ui_ListEvent(this.model,$ui.PhoneLogListItem.ONCLICK);this.model.parent._onaction(this.model,t)}},!1),t.dom}function ws12_TileAcceleration(t,o){return $ui_CoreTileGauge.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-acceleration"),t._setTitle("Acceleration"),t._setAccent("Average G-Forces"),t._providerUpdate=function(t){void 0!=t?(this.min=t.min,this.max=t.max,this.value=t.value,this._populateData()):(this.min=0,this.max=1,this.value=0),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({min:t.min,max:t.max,value:t.value}),t.dom}function ws12_TileBadge(t,o){return t.style=void 0,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-badge"),t.dom.caption=document.createElement("div"),$ui.addClass(t.dom.caption,"caption"),t.dom.contentDiv.appendChild(t.dom.caption),t.dom.next=document.createElement("div"),$ui.addClass(t.dom.next,"button"),$ui.addClass(t.dom.next,"next"),t.dom.contentDiv.appendChild(t.dom.next),t.dom.prev=document.createElement("div"),$ui.addClass(t.dom.prev,"button"),$ui.addClass(t.dom.prev,"prev"),t.dom.contentDiv.appendChild(t.dom.prev),t.dom.accent=document.createElement("div"),$ui.addClass(t.dom.accent,"accent"),t.dom.contentDiv.appendChild(t.dom.accent),t._providerUpdate=function(t){if(void 0!=t?(this.img=t.img,this.caption=t.caption,this.accent=t.accent):(this.img=void 0,this.caption=void 0,this.accent=void 0),this.dom.contentDiv.style.backgroundImage='url("'+this.img+'")',this.caption){var o=this.caption.replace(RegExp("<large>","g"),'<span class="tall">');o=o.replace(RegExp("</large>","g"),"</span>"),this.dom.caption.innerHTML=o}this.accent&&(this.dom.accent.textContent=this.accent),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({img:t.img,caption:t.caption,accent:t.accent}),t.dom}function ws12_TileBraking(t,o){return $ui_CoreTileGauge.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-braking"),t._setTitle("Braking"),t._setAccent("Average G-Forces"),t._providerUpdate=function(t){void 0!=t?(this.min=t.min,this.max=t.max,this.value=t.value,this._populateData()):(this.min=0,this.max=1,this.value=0),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({min:t.min,max:t.max,value:t.value}),t.dom}function ws12_TileDistance(t,o){return t.style=void 0,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-distance"),t.dom.canvas=document.createElement("canvas"),$ui.addClass(t.dom.canvas,"chart"),t.dom.canvas.height=180,t.dom.canvas.width=220,t.dom.contentDiv.appendChild(t.dom.canvas),t.dom.ctx=t.dom.canvas.getContext("2d"),t.dom.chart=new Chart(t.dom.ctx),t.dom.caption=document.createElement("div"),$ui.addClass(t.dom.caption,"caption"),t.dom.contentDiv.appendChild(t.dom.caption),t._providerUpdate=function(t){var o,e=[],i=[],n=!1;for(void 0!=t?(this.data=t.data,this.units=t.units):(this.data=void 0,this.units="miles"),void 0==this.data||this.data&&0==this.data.length?(this.data=[0],n=!0):1==this.data.length&&(this.data=[0,this.data[0]]),this._value=this.data[this.data.length-1],o=0;this.data.length>o;o++)o==this.data.length-1?e.push("Today"):e.push(""),i.push(0);this.dom.caption.innerHTML='<span class="tall distance">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="tall">'+this._value+"</span> "+this.units;var d=parseInt($ui._cutHex($ui.config.brandColor).substring(0,2),16),a=parseInt($ui._cutHex($ui.config.brandColor).substring(2,4),16),s=parseInt($ui._cutHex($ui.config.brandColor).substring(4,6),16),r={labels:e,datasets:[{fillColor:"rgba("+d+","+a+","+s+",0.2)",strokeColor:"rgba("+d+","+a+","+s+",1)",pointColor:"rgba("+d+","+a+","+s+",1)",pointStrokeColor:"#fff",pointHighlightFill:"#fff",pointHighlightStroke:"rgba("+d+","+a+","+s+",1)",data:this.data},{fillColor:"transparent",strokeColor:"transparent",pointColor:"transparent",pointStrokeColor:"transparent",pointHighlightFill:"transparent",pointHighlightStroke:"transparent",data:i}]};this.dom.chart.Line(r,{scaleShowGridLines:!1,showTooltips:!1,scaleFontColor:$ui.config.tileFontColor}),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({data:t.data,units:t.units}),t.dom}function ws12_TileFuel(t,o){return t.style=void 0,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-fuel"),t.dom.canvas=document.createElement("canvas"),$ui.addClass(t.dom.canvas,"chart"),t.dom.canvas.height=180,t.dom.canvas.width=230,t.dom.contentDiv.appendChild(t.dom.canvas),t.dom.ctx=t.dom.canvas.getContext("2d"),t.dom.chart=new Chart(t.dom.ctx),t.dom.leftLabels=document.createElement("div"),$ui.addClass(t.dom.leftLabels,"left-labels"),t.dom.contentDiv.appendChild(t.dom.leftLabels),t.dom.topLabel=document.createElement("div"),$ui.addClass(t.dom.topLabel,"label"),$ui.addClass(t.dom.topLabel,"top"),t.dom.topLabel.textContent="F",t.dom.leftLabels.appendChild(t.dom.topLabel),t.dom.middleLabel=document.createElement("div"),$ui.addClass(t.dom.middleLabel,"label"),$ui.addClass(t.dom.middleLabel,"middle"),t.dom.middleLabel.innerHTML="&#189;",t.dom.leftLabels.appendChild(t.dom.middleLabel),t.dom.bottomLabel=document.createElement("div"),$ui.addClass(t.dom.bottomLabel,"label"),$ui.addClass(t.dom.bottomLabel,"bottom"),t.dom.bottomLabel.textContent="E",t.dom.leftLabels.appendChild(t.dom.bottomLabel),t.dom.caption=document.createElement("div"),$ui.addClass(t.dom.caption,"caption"),t.dom.contentDiv.appendChild(t.dom.caption),t._providerUpdate=function(t){var o,e=[],i=[],n=!1;for(void 0!=t?(this.data=t.data,this.value=t.value):(this.data=void 0,this.value=0),void 0==this.value&&(this.value=0),void 0==this.data||this.data&&0==this.data.length?(this.data=[0],n=!0):1==this.data.length&&(this.data=[0,this.data[0]]),o=0;this.data.length>o;o++)o==this.data.length-1?(e.push("Now"),i.push(0)):(e.push(""),i.push(100));this.dom.caption.innerHTML='<span class="tall">$'+this.value+'</span> of <span class="tall fuel">&nbsp;&nbsp;&nbsp;&nbsp;</span>Today';var d=151,a=187,s=205;$ui.config.inHeadUnit===!0&&(d=parseInt($ui._cutHex($ui.config.brandColor).substring(0,2),16),a=parseInt($ui._cutHex($ui.config.brandColor).substring(2,4),16),s=parseInt($ui._cutHex($ui.config.brandColor).substring(4,6),16));var r={labels:e,datasets:[{fillColor:"rgba("+d+","+a+","+s+",0.2)",strokeColor:"rgba("+d+","+a+","+s+",1)",pointColor:"rgba("+d+","+a+","+s+",1)",pointStrokeColor:"#fff",pointHighlightFill:"#fff",pointHighlightStroke:"rgba("+d+","+a+","+s+",1)",data:this.data},{fillColor:"transparent",strokeColor:"transparent",pointColor:"transparent",pointStrokeColor:"transparent",pointHighlightFill:"transparent",pointHighlightStroke:"transparent",data:i}]};this.dom.chart.Line(r,{scaleShowGridLines:!1,showTooltips:!1,scaleFontColor:$ui.config.tileFontColor}),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({data:t.data,value:t.value}),t.dom}function ws12_TileIdle(t,o){return t.style=void 0,$ui_CoreTileDonutChart.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-idle-chart"),t._calculateData=function(){var t;if(void 0!=this.value){var o;switch(0>this.value&&(this.value=0),this.value>100&&(this.value=100),!0){case this.value>=70:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_GREAT;break;case this.value>=50:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_GOOD;break;default:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_OK}t=[{value:this.value,color:o},{value:100-this.value,color:1==$ui.config.inHeadUnit?$ui.color_DARK:$ui.color_LIGHT}]}return t},t._calculateData=t._calculateData.bind(t),t._providerUpdate=function(t){this.value=void 0!=t?t.value:0;var o=this._calculateData();void 0!=o&&(this._setData(o),this._setCaption('<span class="tall">'+this.value+"%</span> spent moving")),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({value:t.value}),t.dom}function ws12_TileIdleDetails(t,o){return t.style=$ui.Tile.WIDE,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-idle-details"),t.dom.caption=document.createElement("div"),$ui.addClass(t.dom.caption,"caption"),t.dom.contentDiv.appendChild(t.dom.caption),t.dom.caption.textContent="Time Stuck In Traffic (mins)",t.dom.canvas=document.createElement("canvas"),$ui.addClass(t.dom.canvas,"chart"),t.dom.canvas.height=190,t.dom.canvas.width=490,t.dom.contentDiv.appendChild(t.dom.canvas),t.dom.ctx=t.dom.canvas.getContext("2d"),t.dom.chart=new Chart(t.dom.ctx),t._providerUpdate=function(t){void 0!=t?(this.data=t.data,this.labels=t.labels):(this.data=void 0,this.labels=void 0);var o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_OK,e=parseInt($ui._cutHex(o).substring(0,2),16),i=parseInt($ui._cutHex(o).substring(2,4),16),n=parseInt($ui._cutHex(o).substring(4,6),16),d={labels:this.labels,datasets:[{fillColor:"rgba("+e+","+i+","+n+",0.5)",strokeColor:"rgba("+e+","+i+","+n+",1)",data:this.data}]};this.dom.chart.Bar(d,{scaleShowGridLines:!0,showTooltips:!1,scaleFontColor:$ui.config.tileFontColor}),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({data:t.data,labels:t.labels}),t.dom}function ws12_TileMPG(t,o){return t.style=void 0,$ui_CoreTileDonutChart.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-mpg-chart"),t._calculateData=function(){var t;if(void 0!=this.max&&void 0!=this.value){var o,e;switch(0>this.value&&(this.value=0),e=this.value>this.max?100:Math.ceil(100*(this.value/this.max)),!0){case e>90:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_GREAT;break;case e>50:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_GOOD;break;default:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_OK}t=[{value:e,color:o},{value:100-e,color:1==$ui.config.inHeadUnit?$ui.color_DARK:$ui.color_LIGHT}]}return t},t._calculateData=t._calculateData.bind(t),t._providerUpdate=function(t){void 0!=t?(this.value=t.value,this.max=t.max,this.abbreviation=t.abbreviation):(this.value=0,this.max=0,this.abbreviation="MPG");var o=this._calculateData();void 0!=o&&(this._setData(o),this._setCaption('<span class="tall">'+this.value+"</span> "+this.abbreviation)),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({value:t.value,max:t.max,abbreviation:t.abbreviation}),t.dom}function ws12_TileProfile(t,o){t.style=$ui.Tile.TALL,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-profile");var e="#FDBF2F";return t.dom.wedge=document.createElement("div"),$ui.addClass(t.dom.wedge,"wedge"),t.dom.contentDiv.appendChild(t.dom.wedge),t.dom.wedge.style.backgroundColor=1==$ui.config.inHeadUnit?$ui.config.brandColor:e,t.dom.vehicle=document.createElement("div"),$ui.addClass(t.dom.vehicle,"vehicle"),t.dom.contentDiv.appendChild(t.dom.vehicle),t.dom.vehicle.image=document.createElement("div"),$ui.addClass(t.dom.vehicle.image,"vehicle-image"),t.dom.vehicle.appendChild(t.dom.vehicle.image),t.dom.vehicle.overlay=document.createElement("div"),$ui.addClass(t.dom.vehicle.overlay,"vehicle-overlay"),t.dom.vehicle.image.appendChild(t.dom.vehicle.overlay),t.dom.userName=document.createElement("div"),$ui.addClass(t.dom.userName,"name"),t.dom.vehicle.appendChild(t.dom.userName),t._formatNumber=function(t){if(void 0==t)return 0;var o,e;switch(!0){case t>=1e6:e=(t/1e6).toFixed(1),0==e%1&&(e=Math.floor(e)),o=e+"M";break;case t>=1e4:e=(t/1e3).toFixed(1),0==e%1&&(e=Math.floor(e)),o=e+"K";break;case t>=1e3:o=""+t,o=o.slice(0,1)+","+o.slice(1,o.length);break;case 1e3>t:o=t;break;default:o=t}return o},t._formatNumber=t._formatNumber.bind(t),t.dom.stats=document.createElement("div"),$ui.addClass(t.dom.stats,"stats"),t.dom.contentDiv.appendChild(t.dom.stats),1==$ui.config.inHeadUnit&&(t.dom.stats.style.borderColor=$ui.config.brandColor),t.dom.score=document.createElement("div"),$ui.addClass(t.dom.score,"box"),t.dom.stats.appendChild(t.dom.score),t.dom.score.label=document.createElement("div"),$ui.addClass(t.dom.score.label,"label"),t.dom.score.appendChild(t.dom.score.label),t.dom.score.label.textContent="SCORE",t.dom.score.number=document.createElement("div"),$ui.addClass(t.dom.score.number,"number"),t.dom.score.appendChild(t.dom.score.number),1==$ui.config.inHeadUnit?(t.dom.score.style.borderColor=$ui.config.brandColor,t.dom.score.number.style.color=$ui.config.brandColor):t.dom.score.number.style.color=e,t.dom.friends=document.createElement("div"),$ui.addClass(t.dom.friends,"box"),$ui.addClass(t.dom.friends,"right"),t.dom.stats.appendChild(t.dom.friends),t.dom.friends.label=document.createElement("div"),$ui.addClass(t.dom.friends.label,"label"),t.dom.friends.appendChild(t.dom.friends.label),t.dom.friends.label.textContent="FRIENDS",t.dom.friends.number=document.createElement("div"),$ui.addClass(t.dom.friends.number,"number"),t.dom.friends.appendChild(t.dom.friends.number),1==$ui.config.inHeadUnit?(t.dom.friends.style.borderColor=$ui.config.brandColor,t.dom.friends.number.style.color=$ui.config.brandColor):t.dom.friends.number.style.color=e,t.dom.groups=document.createElement("div"),$ui.addClass(t.dom.groups,"box"),$ui.addClass(t.dom.groups,"right"),t.dom.stats.appendChild(t.dom.groups),t.dom.groups.label=document.createElement("div"),$ui.addClass(t.dom.groups.label,"label"),t.dom.groups.appendChild(t.dom.groups.label),t.dom.groups.label.textContent="GROUPS",t.dom.groups.number=document.createElement("div"),$ui.addClass(t.dom.groups.number,"number"),t.dom.groups.appendChild(t.dom.groups.number),1==$ui.config.inHeadUnit?(t.dom.groups.style.borderColor=$ui.config.brandColor,t.dom.groups.number.style.color=$ui.config.brandColor):t.dom.groups.number.style.color=e,t.dom.avatar=document.createElement("div"),$ui.addClass(t.dom.avatar,"avatar"),t.dom.contentDiv.appendChild(t.dom.avatar),1==$ui.config.inHeadUnit&&(t.dom.avatar.style.borderColor=$ui.config.brandColor),t.dom.rankText=document.createElement("div"),$ui.addClass(t.dom.rankText,"rank-text"),t.dom.contentDiv.appendChild(t.dom.rankText),t.dom.rankText.textContent="Ranked",t.dom.rank=document.createElement("div"),$ui.addClass(t.dom.rank,"rank"),t.dom.contentDiv.appendChild(t.dom.rank),t.dom.rank.style.backgroundColor=1==$ui.config.inHeadUnit?$ui.config.brandColor:e,t.dom.findFriend=document.createElement("div"),$ui.addClass(t.dom.findFriend,"button"),$ui.addClass(t.dom.findFriend,"search"),t.dom.findFriend.textContent="Find a Friend",t.dom.contentDiv.appendChild(t.dom.findFriend),t.dom.findFriend.style.backgroundColor=1==$ui.config.inHeadUnit?$ui.config.brandColor:e,t.dom.findGroup=document.createElement("div"),$ui.addClass(t.dom.findGroup,"button"),$ui.addClass(t.dom.findGroup,"plus"),t.dom.findGroup.textContent="Join a Group",t.dom.contentDiv.appendChild(t.dom.findGroup),t.dom.findGroup.style.backgroundColor=1==$ui.config.inHeadUnit?$ui.config.brandColor:e,t._providerUpdate=function(t){void 0!=t?(this.backgroundImg=t.backgroundImg,this.avatar=t.avatar,this.userName=t.userName,this.stats=t.stats):(this.backgroundImg=void 0,this.avatar=void 0,this.userName=void 0,this.stats=void 0),this.backgroundImg?(this.loader=new Image,this.loader.model=this,this.loader.onload=function(){this.model.dom.vehicle.image.style.opacity="1.0",this.model.dom.vehicle.image.style.backgroundImage='url("'+this.model.backgroundImg+'")',this.model.loader=null},this.loader.src=this.backgroundImg):this.dom.vehicle.image.style.backgroundImage="",this.dom.userName.textContent=this.userName?this.userName:"",this.stats?(this.dom.score.number.textContent=this._formatNumber(this.stats.score),this.dom.friends.number.textContent=this._formatNumber(this.stats.friends),this.dom.groups.number.textContent=this._formatNumber(this.stats.groups),this.dom.rank.textContent=this.stats.rank,this.dom.rank.style.opacity="1.0"):(this.dom.score.number.textContent="0",this.dom.friends.number.textContent="0",this.dom.groups.number.textContent="0",this.dom.rank.textContent="1",this.dom.rank.style.opacity="1.0"),this.avatar&&(this.dom.avatar.style.backgroundImage='url("'+this.avatar+'")'),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({backgroundImg:t.backgroundImg,avatar:t.avatar,userName:t.userName,stats:t.stats}),t.dom}function ws12_TileRecord(t,o){return t.style=void 0,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-record"),t.dom.stage1=document.createElement("div"),$ui.addClass(t.dom.stage1,"stage-1"),t.dom.contentDiv.appendChild(t.dom.stage1),t.dom.recordButton=document.createElement("div"),t.dom.recordButton.model=t,$ui.addClass(t.dom.recordButton,"record-button"),t.dom.recordButton.style.backgroundColor=$ui.config.brandColor,t.dom.stage1.appendChild(t.dom.recordButton),t.dom.recordButton.textContent="Start",t.dom.recordButton.onclick=function(){var t=this.model;return $ui.playTouchSound(),t.onstartclick&&t.onstartclick(),t.countdown===!0?(t.dom.stage1.style.display="none",t.dom.stage2.style.display="inline",t._countDownNum=3,t._interval=window.setInterval(t._countDownInterval,1e3),t.oncountdown&&t.oncountdown(),void 0):(t.onrecord&&t.onrecord(),void 0)},t.dom.recordButton.ontouchstart=function(){this.style.opacity="0.7"},t.dom.recordButton.ontouchend=function(){this.style.opacity="1.0"},t.dom.recordButton.ontouchcancel=t.dom.recordButton.ontouchend,$ui.isMobileDevice()||(t.dom.recordButton.onmousedown=t.dom.recordButton.ontouchstart,t.dom.recordButton.onmouseup=t.dom.recordButton.ontouchend,t.dom.recordButton.onmouseleave=t.dom.recordButton.ontouchend),t.dom.captionDiv=document.createElement("div"),$ui.addClass(t.dom.captionDiv,"caption"),t.dom.stage1.appendChild(t.dom.captionDiv),t.caption&&(t.dom.captionDiv.textContent=t.caption),t.dom.stage2=document.createElement("div"),$ui.addClass(t.dom.stage2,"stage-2"),t.dom.contentDiv.appendChild(t.dom.stage2),t.dom.number=document.createElement("div"),$ui.addClass(t.dom.number,"number"),t.dom.stage2.appendChild(t.dom.number),t.dom.number.textContent="3",t._countDownInterval=function(){return this._countDownNum--,0===this._countDownNum?(window.clearInterval(this._interval),this._interval=void 0,this.dom.number.textContent="GO!",this.dom.number.style.backgroundColor=$ui.config.brandColor,$ui.addClass(this.dom.number,"animation"),this.onrecord&&this.onrecord(),void 0):(this.dom.number.textContent=this._countDownNum,this.oncountdown&&this.oncountdown(),void 0)},t._countDownInterval=t._countDownInterval.bind(t),t._providerUpdate=function(){void 0!=this._interval&&(window.clearInterval(this._interval),this._interval=void 0)},t._providerUpdate=t._providerUpdate.bind(t),t.reset=function(){void 0!=this._interval&&(window.clearInterval(this._interval),this._interval=void 0),this.dom.number.style.backgroundColor="",this.dom.number.textContent="3",$ui.removeClass(this.dom.number,"animation"),this.dom.stage2.style.display="none",this.dom.stage1.style.display=""},t.reset=t.reset.bind(t),t.dom}function ws12_TileTimer(t,o){return t.style=$ui.Tile.WIDE,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-timer"),t.dom.numbers=document.createElement("div"),$ui.addClass(t.dom.numbers,"numbers"),t.dom.contentDiv.appendChild(t.dom.numbers),t.dom.numbers.textContent="00:00:00",t._doInterval=function(){var o=new Date;this._milliseconds=o-this._startTime;var e,i=Math.floor(this._milliseconds/6e4),n=Math.floor(this._milliseconds/1e3)%60;e=(this._milliseconds/1e3).toFixed(2)-Math.floor(this._milliseconds/1e3),e=Math.floor(100*e),e=e>=100?0:e,i=i>=10?i:"0"+i,n=n>=10?n:"0"+n,e=e>=10?e:"0"+e,t.dom.numbers.textContent=i+":"+n+":"+e},t._doInterval=t._doInterval.bind(t),t.reset=function(){void 0!=this._interval&&(window.clearInterval(this._interval),this._milliseconds=0,this._interval=void 0),this.dom.numbers.textContent="00:00:00",this.onreset&&this.onreset()},t.reset=t.reset.bind(t),t.start=function(){void 0==this._interval&&(this._startTime=new Date,this._milliseconds=0,this._interval=window.setInterval(this._doInterval,10),this.onstart&&this.onstart())},t.start=t.start.bind(t),t.stop=function(){void 0!=this._interval&&(window.clearInterval(this._interval),this._interval=void 0,this.onstop&&this.onstop())},t.stop=t.stop.bind(t),t.getMilliseconds=function(){return this._milliseconds},t.getMilliseconds=t.getMilliseconds.bind(t),t.getSeconds=function(){return(this._milliseconds/1e3).toFixed(1)},t.getSeconds=t.getSeconds.bind(t),t.getMinutes=function(){return(this._milliseconds/6e4).toFixed(2)},t.getMinutes=t.getMinutes.bind(t),t._destroy=function(){void 0!=this._interval&&(window.clearInterval(this._interval),this._interval=void 0)},t._destroy=t._destroy.bind(t),t._onbeforepop=function(){this.stop()},t._onbeforepop=t._onbeforepop.bind(t),t.dom}function ws12_TileWeeksActivity(t,o){return t.style=$ui.Tile.WIDE,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-weeks-activity"),t.dom}function ws12_TileZeroToSixty(t,o){return t.style=void 0,$ui_CoreTileDonutChart.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-zero-to-sixty"),t._calculateData=function(){var t;if(void 0!=this.target&&void 0!=this.value){var o,e;switch(0>this.value&&(this.value=0),e=this.value<this.target?100:Math.ceil(100*(this.target/this.value)),!0){case e>90:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_GREAT;break;case e>50:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_GOOD;
break;default:o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_OK}t=[{value:e,color:o},{value:100-e,color:1==$ui.config.inHeadUnit?$ui.color_DARK:$ui.color_LIGHT}]}return t},t._calculateData=t._calculateData.bind(t),t._providerUpdate=function(t){void 0!=t?(this.value=t.value,this.target=t.target,this.accent=t.accent):(this.value=0,this.target=0,this.accent=void 0);var o=this._calculateData();void 0!=o&&(this._setData(o),this._setCaption('<span class="tall">'+this.value+"</span>&nbsp;sec 0-60"),this._setAccent(this.accent)),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({value:t.value,target:t.target,accent:t.accent}),t.dom}function ws12_TileZeroToSixtyHistory(t,o){return t.style=$ui.Tile.WIDE,$ui_CoreTile.call(this,t,o),$ui.addClass(t.dom,"ws12-tile-zero-to-sixty-history"),t.dom.caption=document.createElement("div"),$ui.addClass(t.dom.caption,"caption"),t.dom.contentDiv.appendChild(t.dom.caption),t.dom.caption.textContent="Recorded 0-60 times (sec)",t.dom.canvas=document.createElement("canvas"),$ui.addClass(t.dom.canvas,"chart"),t.dom.canvas.height=190,t.dom.canvas.width=490,t.dom.contentDiv.appendChild(t.dom.canvas),t.dom.ctx=t.dom.canvas.getContext("2d"),t.dom.chart=new Chart(t.dom.ctx),t._providerUpdate=function(t){void 0!=t?(this.data=t.data,this.labels=t.labels):(this.data=void 0,this.labels=void 0);var o=1==$ui.config.inHeadUnit?$ui.config.brandColor:$ui.color_OK,e=parseInt($ui._cutHex(o).substring(0,2),16),i=parseInt($ui._cutHex(o).substring(2,4),16),n=parseInt($ui._cutHex(o).substring(4,6),16),d={labels:this.labels,datasets:[{fillColor:"rgba("+e+","+i+","+n+",0.5)",strokeColor:"rgba("+e+","+i+","+n+",1)",data:this.data}]};this.dom.chart.Line(d,{scaleShowGridLines:!0,showTooltips:!1,scaleFontColor:$ui.config.tileFontColor}),this.showContent(!0)},t._providerUpdate=t._providerUpdate.bind(t),void 0==t.provider&&t._providerUpdate({data:t.data}),t.dom}var $ws12={init:function(){$ui.addExtension({name:"Browser",definition:{},constructor:ws12_Browser}),$ui.addExtension({name:"DialPad",definition:{},constructor:ws12_DialPad}),$ui.addExtension({name:"Map",definition:{},constructor:ws12_Map}),$ui.addExtension({name:"MediaPlayer",definition:{},constructor:ws12_MediaPlayer}),$ui.addExtension({name:"TileAcceleration",definition:{},constructor:ws12_TileAcceleration}),$ui.addExtension({name:"TileBadge",definition:{},constructor:ws12_TileBadge}),$ui.addExtension({name:"TileBraking",definition:{},constructor:ws12_TileBraking}),$ui.addExtension({name:"TileDistance",definition:{},constructor:ws12_TileDistance}),$ui.addExtension({name:"TileFuel",definition:{},constructor:ws12_TileFuel}),$ui.addExtension({name:"TileIdle",definition:{},constructor:ws12_TileIdle}),$ui.addExtension({name:"TileIdleDetails",definition:{},constructor:ws12_TileIdleDetails}),$ui.addExtension({name:"TileMPG",definition:{},constructor:ws12_TileMPG}),$ui.addExtension({name:"TileProfile",definition:{},constructor:ws12_TileProfile}),$ui.addExtension({name:"TileRecord",definition:{},constructor:ws12_TileRecord}),$ui.addExtension({name:"TileTimer",definition:{},constructor:ws12_TileTimer}),$ui.addExtension({name:"TileWeeksActivity",definition:{},constructor:ws12_TileWeeksActivity}),$ui.addExtension({name:"TileZeroToSixty",definition:{},constructor:ws12_TileZeroToSixty}),$ui.addExtension({name:"TileZeroToSixtyHistory",definition:{},constructor:ws12_TileZeroToSixtyHistory}),$ui.addExtension({name:"PhoneLogListItem",definition:{ONCLICK:"onclick",INCOMING:"incoming",OUTGOING:"outgoing",MISSED:"missed"},type:$ui.ExtensionType.LISTITEM,constructor:ws12_PhoneLogListItem})}};ws12_BrowserButton.prototype=new $ui_CoreComponent,ws12_Browser.prototype=new $ui_CoreComponent,ws12_DialPadButton.prototype=new $ui_CoreComponent,ws12_DialPad.prototype=new $ui_CoreComponent,ws12_Browser.prototype=new $ui_CoreComponent,ws12_Browser.prototype=new $ui_CoreComponent,ws12_PhoneLogListItem.prototype=new $ui_CoreComponent,ws12_TileAcceleration.prototype=new $ui_CoreTileGauge,ws12_TileBadge.prototype=new $ui_CoreTile,ws12_TileBraking.prototype=new $ui_CoreTileGauge,ws12_TileDistance.prototype=new $ui_CoreTile,ws12_TileFuel.prototype=new $ui_CoreTile,ws12_TileIdle.prototype=new $ui_CoreTileDonutChart,ws12_TileIdleDetails.prototype=new $ui_CoreTile,ws12_TileMPG.prototype=new $ui_CoreTileDonutChart,ws12_TileProfile.prototype=new $ui_CoreTile,ws12_TileRecord.prototype=new $ui_CoreTile,ws12_TileTimer.prototype=new $ui_CoreTile,ws12_TileWeeksActivity.prototype=new $ui_CoreTile,ws12_TileZeroToSixty.prototype=new $ui_CoreTileDonutChart,ws12_TileZeroToSixtyHistory.prototype=new $ui_CoreTile;