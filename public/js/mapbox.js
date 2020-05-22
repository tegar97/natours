/* eslint-disable */


export const displayMap = (locations) =>{
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVnYXI5NyIsImEiOiJja2E5cGZkOTEwcDRqMzZxd2JseTJkeHFvIn0.LMbaPGak9iK7oTk2n5GqBw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/tegar97/cka9psviy28lk1ilj86ptp9as',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();


    locations.forEach(loc => {

        //Create marker
        const el = document.createElement('div')
        el.className = 'marker'

        //Add Marker
        new mapboxgl.Marker({
            element :el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map)

        //Add popup
    
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>${loc.day} : ${loc.description}</p>`)
            .addTo(map)
        //Extend map bounds to include current location
        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds,{
        padding : {
            top: 200,
            bottom: 200,
            left : 100,
            right : 100
        }
    })}

