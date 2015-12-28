
Ext.BLANK_IMAGE_URL = "ext/resources/images/default/s.gif";
Ext.onReady(
function()
{
	Ext.QuickTips.init();
	OpenLayers.ProxyHost = "/geoserver/rest/proxy?url=";
	
	var gmap = new OpenLayers.Layer.Google(
                "Google Satellite",
                {/*sphericalMercator: true,*/ type: G_HYBRID_MAP, numZoomLevels: 22}
    );
	
	var fafg = new OpenLayers.Layer.WMS(
        "FAFG",
        "http://localhost:8080/geoserver/wms",
        {
			layers: 'fafg:proyectos',
			transparent:true,
			format: 'image/png',
			SRS: 'EPSG:4326'
		}
	);
	
		
	
	//MAPA	
	var map = new OpenLayers.Map('map',{
		numZoomLevels:20,
		projection: new OpenLayers.Projection("EPSG:4326"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		controls:   [
						new OpenLayers.Control.OverviewMap(),
						new OpenLayers.Control.PanZoom(),
						new OpenLayers.Control.Permalink(),
						new OpenLayers.Control.Navigation(),
						new OpenLayers.Control.ScaleLine({maxWidth: 400}),
						new OpenLayers.Control.MousePosition(),
						new OpenLayers.Control.LayerSwitcher()
					]
	});
		
	var panel_info = new Ext.Panel({
		region: 'center',
		html: 'La Fundación de Antropología Forense de Guatemala (FAFG) es una organización no gubernamental, autónoma, técnico-científica, sin fines de lucro que contribuye al fortalecimiento del sistema de justicia y al respeto de los derechos humanos; a través de la investigación, la documentación, la divulgación, la formación y la sensibilización de los hechos históricos de violaciones al derecho a la vida y de casos de muerte no esclarecidos.'
	});
	
	
	var panel_mapa = new GeoExt.MapPanel({
		map: map,
		id: 'mappanel',
		center: new OpenLayers.LonLat(-90.3, 16),
		zoom: 9,
		layers: [fafg,gmap]
		/*,tbar: new Ext.Toolbar({
			items: [
							{
								xtype: 'tbbutton',
								toggleGroup: 'tools',
								group: 'tools',
								map: map,
								tooltip: "Información",
								text: 'Información',
								handler: function f(){console.log(control_feature);   control_feature.activate();	console.log(control_feature);}
							}
				   ]
		})
		*/
	});


	//GET FEATURE INFO
	var control_feature = new OpenLayers.Control.WMSGetFeatureInfo({
				url: '/geoserver/wms?SERVICE=WMS&',
				drillDown: true,
				queryVisible: true
				/*
				//drillDown: true,
				vendorParams: {
//					"format": "text/html",
					request:"GetFeature",
				}
				*/
	});

	control_feature.events.register("getfeatureinfo",this,show);
	map.addControl(control_feature);
	control_feature.activate();

	function show(evt){
		
		window.txt = evt.text;
		var match = evt.text.match(/<body>([\s\S]*)<\/body>/);
		var html;
		if (match && !match[1].match(/^\s*$/)) {
			var popup = new GeoExt.Popup({
				title: 'Informacion',
				width:240,
				height: 180,
				autoScroll: true,
				map: map,
				//lonlat: new OpenLayers.LonLat(map.getLonLatFromViewPortPx(evt.xy)),
				//lonlat: map.getLonLatFromViewPortPx(evt.xy),
				location: map.getLonLatFromViewPortPx(evt.xy),
				x: evt.xy.x,
				y: evt.xy.y,
				html: evt.text,
				maximizable: true,
				collapsible: true,
				draggable: true
				/*
				listeners: {
                    close: function() {
                        // closing a popup destroys it, but our reference is truthy
                        popup = null;
                    }
                }
				*/
			});
			popup.show();
		} 
	}	
	
	var panel_leyenda = new GeoExt.LegendPanel({
		title: 'Leyenda',
		region:'south',
		frame: true,
		collapsible: true,
		split: true,
		height: 200,
		layers: panel_mapa.layers
	});
	
	
	var panel = new Ext.Viewport({
		layout: 'border',
		items: [
					{
						xtype: 'panel',
						region: 'north',
						height: 100,
						html: '<div id=panel_logo width=100% style="background: black"><img src="files/img/banner_fafg.jpg"></div>'
					},
					{
						xtype: 'panel',
						region: 'center',
						items: [
									panel_mapa
							   ]
					},
					{
						xtype: 'panel',
						region: 'west',
						layout: 'border',
						//title: 'Herramientas',
						collapsible: true,
						split: true,
						width: 200,
						items: [
									panel_info,
									panel_leyenda
							   ]
					}
			   ]
	});
}
);