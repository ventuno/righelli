/*
    This file is part of Righelli.

    Righelli is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Righelli is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Righelli.  If not, see <http://www.gnu.org/licenses/>.
*/

var righelli = function () {
    this.init();
};

righelli.VERTICAL = 0;
righelli.HORIZONTAL = 1;
righelli.CLICKABLE_AREA_SIZE = 10; //px, needs to be the same as width/height defined in div.horizontalRuler/div.verticalRuler in the css file
righelli.CLICKABLE_AREA_SIZE_2 = righelli.CLICKABLE_AREA_SIZE/2;

righelli.prototype = {
    init : function () {
        //alert("initing righelli! -- content script")
        this._oBody = $("body");

        this._oVerticalRulerSource = this.createRulerSource(righelli.VERTICAL);
        this._oHorizontalRulerSource = this.createRulerSource(righelli.HORIZONTAL);
        this._oHighlightSurface = this.createHighlightSurface();
        this._oCurrentRuler = null;
        this._aVerticalRulers = [];
        this._aHorizontalRulers = [];
        this._iCurrentMouseX = 0;
        this._iCurrentMouseY = 0;
        this._bPreventDefault = false;

        $(document).bind("mousedown", $.proxy(this._onMouseDown, this));
        $(document).bind("mousemove", $.proxy(this._onMouseMove, this));
        $(document).bind("mouseup", $.proxy(this._onMouseUp, this));
        $(document).bind("keydown", "ctrl", $.proxy(this._onKeyDown, this));
        $(document).bind("keyup", "ctrl", $.proxy(this._onKeyUp, this));
        document.addEventListener("contextmenu", $.proxy(this._onContextMenu, this));
        window.addEventListener("unload", $.proxy(this._onUnload, this));

        this._bIsInited = true;
    },

    exit : function () {
        this._bIsInited = false;
        this._oBody = null;

        if (this._oVerticalRulerSource) {
            this._oVerticalRulerSource.remove();
            this._oVerticalRulerSource = null;
        }
        if (this._oHorizontalRulerSource) {
            this._oHorizontalRulerSource.remove();
            this._oHorizontalRulerSource = null;
        }
        if (this._oHighlightSurface) {
            this._oHighlightSurface.remove();
            this._oHighlightSurface = null;
        }
        this._oCurrentRuler = null;
        //remove all rulers
        for (var i = this._aVerticalRulers.length-1; i >= 0; i--)
            this._removeRuler(this._aVerticalRulers[i]);
        for (var i = this._aHorizontalRulers.length-1; i >= 0 ; i--)
            this._removeRuler(this._aHorizontalRulers[i]);
        this._aVerticalRulers = null;
        this._aHorizontalRulers = null;
        this._bPreventDefault = false;

        $(document).unbind("mousedown", $.proxy(this._onMouseDown, this));
        $(document).unbind("mousemove", $.proxy(this._onMouseMove, this));
        $(document).unbind("mouseup", $.proxy(this._onMouseUp, this));
        $(document).unbind("keydown", $.proxy(this._onKeyDown, this));
        $(document).unbind("keyup", $.proxy(this._onKeyUp, this));
        document.removeEventListener("contextmenu", $.proxy(this._onContextMenu, this));
        window.removeEventListener("unload", $.proxy(this._onUnload, this));
    },

    isInited: function () {
        return this._bIsInited;
    },

    _indexOf: function (aArray, oRuler) {
        if (Array.isArray(aArray)) {
            for (var i = 0; i < aArray.length; i++) {
                if (oRuler.is(aArray[i]))
                    return i;
            }    
        }
        return -1;
    },

    _setupHighlightSurface: function () {
        var iX = this._iCurrentMouseX;
        var iY = this._iCurrentMouseY;
        var iHightlightWidth = 0;
        var iHightlightHeight = 0;
        var iHightlightLeft = 0;
        var iHightlightRight = 0;
        var iHightlightTop = 0;
        var iHightlightBottom = 0;
        for (var i = 0; i < this._aVerticalRulers.length; i++) {
            var oRuler = this._aVerticalRulers[i];
            var iLeft = oRuler.position().left;
            if (iLeft > iX) {
                iHightlightWidth = iLeft - iHightlightLeft;
                iHightlightRight = $(window).width() - iLeft; //iLeft;
                break;
            }
            else if (iLeft < iX)
                iHightlightLeft = iLeft;
        }

        for (var i = 0; i < this._aHorizontalRulers.length; i++) {
            var oRuler = this._aHorizontalRulers[i];
            var iTop = oRuler.position().top;
            if (iTop > iY) {
                iHightlightHeight = iTop - iHightlightTop;
                iHightlightBottom = $(window).height() - iTop;
                break;
            }
            else if (iTop < iY)
                iHightlightTop = iTop;
        }

        if (this._bCTRLPressed) {
            var oHighlightSurfacePosition = this._oHighlightSurface.position();
            var iHSCurrentX = oHighlightSurfacePosition.left-righelli.CLICKABLE_AREA_SIZE_2;
            var iHSCurrentY = oHighlightSurfacePosition.top-righelli.CLICKABLE_AREA_SIZE_2;
            var iHSCurrentRight = parseInt(this._oHighlightSurface.css("right"))+righelli.CLICKABLE_AREA_SIZE_2;
            var iHSCurrentBottom = parseInt(this._oHighlightSurface.css("bottom"))+righelli.CLICKABLE_AREA_SIZE_2;
            if (iHSCurrentX < iHightlightLeft && (!this._bMovingRight && !this._bMovingLeft)) {
                this._bMovingRight = true;
            } else if (iHSCurrentX > iHightlightLeft && (!this._bMovingRight && !this._bMovingLeft)) {
                this._bMovingLeft = true;
            }

            if (iHSCurrentY > iHightlightTop && (!this._bMovingTop && !this._bMovingBottom)) {
                this._bMovingTop = true;
            } else if (iHSCurrentY < iHightlightTop && (!this._bMovingTop && !this._bMovingBottom)) {
                this._bMovingBottom = true;
            }

            if (this._bMovingRight) {
                iHightlightLeft = iHSCurrentX;
            } else if (this._bMovingLeft) {
                iHightlightRight = iHSCurrentRight;
            }

            if (this._bMovingTop) {
                iHightlightBottom = iHSCurrentBottom;
            } else if (this._bMovingBottom) {
                iHightlightTop = iHSCurrentY;
            }
        }
        
        this._oHighlightSurface.css("left", (iHightlightLeft+righelli.CLICKABLE_AREA_SIZE_2)+"px");
        this._oHighlightSurface.css("top", (iHightlightTop+righelli.CLICKABLE_AREA_SIZE_2)+"px");
        this._oHighlightSurface.css("right", (iHightlightRight-righelli.CLICKABLE_AREA_SIZE_2)+"px");
        this._oHighlightSurface.css("bottom", (iHightlightBottom-righelli.CLICKABLE_AREA_SIZE_2)+"px");
        this._oHighlightSurface.css("visibility", "visible");
        //this._oHighlightSurface.find(".highlightsurfaceLocationInfo").text(this._oHighlightSurface.width() + "px x " + this._oHighlightSurface.height() + "px");
        this.setHighlightSurfaceLocationInfoValues(this._oHighlightSurface.width(), this._oHighlightSurface.height(), "px");
    },

//Listeners

    _onKeyDown: function (oEvent) {
        if (oEvent.which == 17) { //CTRL
            this._setupHighlightSurface();
            this._bCTRLPressed = true;
        }
    },

    _onKeyUp: function (oEvent) {
        this._bCTRLPressed = false;
        this._bMovingRight = false;
        this._bMovingLeft = false;
        this._bMovingTop = false;
        this._bMovingBottom = false;
        this._oHighlightSurface.css("visibility", "hidden");
    },

    _onMouseDown: function (oEvent) {
        var oTarget = $(oEvent.target);
        if (oTarget.hasClass("source") || this._isRuler(oTarget)) {
            if (oEvent.which === 1) {
                if (this._oVerticalRulerSource.is(oEvent.target))
                    this._oCurrentRuler = this.createVerticalRuler();
                else if (this._oHorizontalRulerSource.is(oEvent.target))
                    this._oCurrentRuler = this.createHorizontalRuler();
            } else if (oEvent.which === 3 && this._isRuler(oTarget)) {
                this._removeRuler(oTarget);
                this._bPreventDefault = true;
                oEvent.preventDefault();
                return false;
            }
            oEvent.preventDefault();
        }
    },

    _onMouseMove: function (oEvent) {
        this._iCurrentMouseX = oEvent.pageX;
        this._iCurrentMouseY = oEvent.pageY;
        if (this._oCurrentRuler) {
            if (this._isVerticalRuler(this._oCurrentRuler))
                this._oCurrentRuler.css("left", (this._iCurrentMouseX-righelli.CLICKABLE_AREA_SIZE_2)+"px"); //-righelli.CLICKABLE_AREA_SIZE/2, correction as the actual ruler is wrapped around by a "clickable area"
            else
                this._oCurrentRuler.css("top", (this._iCurrentMouseY-righelli.CLICKABLE_AREA_SIZE_2)+"px");
            oEvent.preventDefault();
        } else if (this._bCTRLPressed) {
            this._setupHighlightSurface();
        }
    },

    _onMouseUp: function (oEvent) {
        if (this._oCurrentRuler) {
            if (this._isVerticalRuler(this._oCurrentRuler))
                this._aVerticalRulers.sort(this._sortRulers)
            else if (this._isHorizontalRuler(this._oCurrentRuler))
                this._aHorizontalRulers.sort(this._sortRulers)
            this._oCurrentRuler = null;
            oEvent.preventDefault();
        }
    },

    _onContextMenu: function (oEvent) {
        if (this._bPreventDefault) {
            this._bPreventDefault = false;
            oEvent.preventDefault();
            return false;
        }
    },

    _onUnload: function (oEvent) {
        this.exit();
    },

//Highlight surface
    createHighlightSurface: function () {
        var oDiv = $('<div/>');
        oDiv.addClass("highlightsurface");
        var oLocationDiv = $('<div/>');
        oLocationDiv.addClass("highlightsurfaceLocationInfo");
        this.addHighlightSurfaceLocationInfoValue(oLocationDiv);
        var oMultSignSpan = $('<span> &times; </span>');
        oMultSignSpan.addClass("highlightsurfaceLocationInfoMultSign");
        oLocationDiv.append(oMultSignSpan);
        this.addHighlightSurfaceLocationInfoValue(oLocationDiv);
        oDiv.append(oLocationDiv);
        this._oBody.append(oDiv);
        return oDiv;
    },

    addHighlightSurfaceLocationInfoValue: function (oDiv) {
        var oLocationSpanInfoValue = $('<span/>');
        oLocationSpanInfoValue.addClass("highlightsurfaceLocationInfoValue");
        var oLocationSpanInfoUnit = $('<span/>');
        oLocationSpanInfoUnit.addClass("highlightsurfaceLocationInfoUnit");
        oDiv.append(oLocationSpanInfoValue);
        oDiv.append(oLocationSpanInfoUnit);
    },

    setHighlightSurfaceLocationInfoValues: function (iValue1, iValue2, sUnit) {
        var aHighlightsurfaceLocationInfoValues = this._oHighlightSurface.find(".highlightsurfaceLocationInfoValue");
        $(aHighlightsurfaceLocationInfoValues[0]).text(iValue1);
        $(aHighlightsurfaceLocationInfoValues[1]).text(iValue2);
        var aHighlightsurfaceLocationInfoUnits = this._oHighlightSurface.find(".highlightsurfaceLocationInfoUnit");
        $(aHighlightsurfaceLocationInfoUnits[0]).text(sUnit);
        $(aHighlightsurfaceLocationInfoUnits[1]).text(sUnit);
    },

//Ruler source
    createRulerSource: function (iRulerType) {
        var oDiv = $('<div/>');
        oDiv.addClass("source");
        if (iRulerType == righelli.VERTICAL) {
            oDiv.addClass("verticalSource");
        } else {
            oDiv.addClass("horizontalSource");
        }
        this._oBody.append(oDiv);
        return oDiv;
    },

//Rulers
    createRuler: function (iRulerType) {
        var oDiv = $('<div/>');
        oDiv.addClass("ruler");
        var oRealRuler = $('<div/>');
        oRealRuler.addClass("realRuler");
        oDiv.append(oRealRuler);
        if (iRulerType == righelli.VERTICAL) {
            oDiv.addClass("verticalRuler");
            this._aVerticalRulers.push(oDiv);
        } else {
            oDiv.addClass("horizontalRuler");
            this._aHorizontalRulers.push(oDiv);
        }
        this._oBody.append(oDiv);
        return oDiv;
    },

    createVerticalRuler: function () {
        return this.createRuler(righelli.VERTICAL);
    },

    createHorizontalRuler: function () {
        return this.createRuler(righelli.HORIZONTAL);
    },

    _removeRuler: function (oRuler) {
        if (this._isVerticalRuler(oRuler)) {
            var iIndex = this._indexOf(this._aVerticalRulers, oRuler);
            this._aVerticalRulers.splice(iIndex, 1);
        } else if (this._isHorizontalRuler(oRuler)) {
            var iIndex = this._indexOf(this._aHorizontalRulers, oRuler);
            this._aHorizontalRulers.splice(iIndex, 1);
        }
        if (oRuler.hasClass("realRuler"))
            oRuler.parent().remove();
        else
            oRuler.remove();
    },

    _sortRulers: function (oA, oB) {
        if (oA.hasClass("verticalRuler")) {
            return parseInt(oA.css("left")) - parseInt(oB.css("left"))
        } else {
            return parseInt(oA.css("top")) - parseInt(oB.css("top"))
        }
    },

//Rulers-related commodity functions
    _isRuler: function (oRuler) {
        return oRuler.hasClass("ruler") || oRuler.parent() && oRuler.parent().hasClass("ruler");
    },

    _isRulerWithClass: function (oRuler, sClass) {
        return oRuler.hasClass(sClass) || oRuler.parent() && oRuler.parent().hasClass(sClass);
    },

    _isVerticalRuler: function (oRuler) {
        return this._isRulerWithClass(oRuler, "verticalRuler");
    },

    _isHorizontalRuler: function (oRuler) {
        return this._isRulerWithClass(oRuler, "horizontalRuler");
    }
};

var r = new righelli();
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message.cmd == "init") {
        if (!r.isInited()) {
            r.init();
            sendResponse({});
        }
    } else if (message.cmd == "exit") {
        r.exit();
        //r = null;
    }
});