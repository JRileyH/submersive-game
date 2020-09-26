var stations = [
  'torpedo',
  'engine',
  'recycler',
  'mines',
  'sonar',
  'stealth',
  'laboratory',
  'repair',
  'drill',
  'turbine',
  'scrap',
  'cargo',
];

var slots = [
  {x: 2, y: 1},
  {x: 2, y: 2},
  {x: 1.5, y: 3},
  {x: 2.5, y: 3, swap: true},
  {x: 2, y: 4},
  {x: 2, y: 5},
  {x: 4.5, y: 1.5},
  {x: 4, y: 2.5},
  {x: 5, y: 2.5, swap: true},
  {x: 4, y: 3.5},
  {x: 5, y: 3.5, swap: true},
  {x: 4, y: 4.5},
  {x: 5, y: 4.5, swap: true},
  {x: 7, y: 3},
  {x: 6.5, y: 4},
  {x: 7.5, y: 4, swap: true},
]

var pockets = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

var stationDescriptions = {
  torpedo: 'Torpedo allows player to use 1 AP and 3 scrap to place a targeting token on an opponent\'s station tile. If the opponent is unable to avoid damage that station becomes disabled. At each upgrade level you gain an additional targeting token to place that turn. Each token still incures an AP and scrap cost.',
  engine: 'Engine allows player to spend 3 fuel in an attempt to avoid damage from a torpedo targeting them that turn. Before taking damage the player can roll 1d6 and avoid damage if 5 or greater.  At level 2 the avoidance chance goes to 3 or greater. At level 3 avoidance is guaranteed. You may only use this ability once per turn even if targeted by multiple torpedos.',
  recycler: 'Recycler allows the player to reduce cost of combat stations. At level 2 scrap/fuel costs are reduced by 1. At level 3 scrap/fuel costs are reduced by 2. If disabled scrap/fuel costs are increased by 1.',
  mines: 'Mines are placed at the beginning of the preparation round. A player can place or change one mine token face down. If the station matching that number is targetted with a torpedo the station takes no damage and the player is awarded a comabt victory point. With each upgrade you can place an additional mine.',
  sonar: 'Sonar allows player to use 1 AP and 3 power to place an intel token on an opponent\'s station tile. If the opponent is unable to avoid detection information about that station is revealed. At level 1 you can reveal if a station has a bomb on it. If it does you can move any targeting on that station. At level 2 you can reveal the card by flipping it in addition to detecting mines. At level 3 you gain an additional intel token.',
  stealth: 'Stealth allows player to spend 3 fuel in an attempt to avoid detection from sonar targeting them that turn. Before taking revealing info the player can roll 1d6 and avoid detection if 5 or greater.  At level 2 the avoidance chance goes to 3 or greater. At level 3 avoidance is guaranteed. You may only use this ability once per turn even if targeted by multiple sonar.',
  laboratory: 'Laboratory allows the player to reduce cost of intel stations. At level 2 power/fuel costs are reduced by 1. At level 3 power/fuel costs are reduced by 2. If disabled power/fuel costs are increased by 1.',
  repair: '???',
  drill: 'Drill allows player to place dice on the fuel resource. If disabled you may not gather fuel from any source that turn. At each upgrade you gain a black dice that remains perminately on the fuel resource in addition to the white dice you can place during preparation.',
  turbine: 'Turbine allows player to place dice on the power resource. If disabled you may not gather power from any source that turn. At each upgrade you gain a yellow dice that remains perminately on the power resource in addition to the white dice you can place during preparation.',
  scrap: 'Scrap Claw allows player to place dice on the scrap resource. If disabled you may not gather scrap from any source that turn. At each upgrade you gain a red dice that remains perminately on the scrap resource in addition to the white dice you can place during preparation.',
  cargo: 'Cargo is used to determine how large you resource hand can be at the and of a turn. At level 1 hand size is 6. Each upgrade increases hand size by 3 (9 & 12) and disabled reduces hand size to 3. At the end of the turn, after spending resources if your hand is greater than hand size you must discard until you are holding the handsize.',
}

var selectedTileSlot = null;

for(var index in slots) {
  // Setup tile slots on board
  var coordinates = slots[index];
  var idx = Number(index) + 1;
  var id = `station-slot-${idx}`;
  $('#schematic').append(`
    <div id="${id}" class="station-slot" data-value=${index}>
      <b class="${coordinates.swap ? 'swap' : ''}">${idx}</b>
    </div>
  `);
  $(`#${id}`)
    .css({
      top: (coordinates.y * 128),
      left: (coordinates.x * 128)
    })
    .mouseenter(function(event) {
      selectedTileSlot = $(event.target);
    })
    .mouseleave(function(event) {
      if(selectedTileSlot.attr('id') === $(event.target).attr('id')) selectedTileSlot = null;
    });

}
// Set color classes for upgrade list
for (var index in stations) {
  var station = stations[index];
  var categeory
  if (['torpedo', 'engine', 'recycler', 'mines'].includes(station)) {
    categeory = 'combat'
  } else if (['sonar', 'stealth', 'laboratory', 'repair'].includes(station)) {
    categeory = 'intel'
  } else {
    categeory = 'resource'
  }
  // Fill in upgrade list
  $('#upgrade-list').append(`
    <div id="${station}-upgrade-item" class="station-upgrade-item container ${categeory}">
      <div class="columns">
        <div class="column col-6 ${station}"></div>
        <div id="${station}-upgrade" class="station-upgrade column col-6"></div>
      </div>
    </div>
  `)
  // Create tiles
  var id = `${station}-tile-${index}`
  $('#schematic').append(`
    <div id="${id}" class="station-tile ${station}" data-value="${station}"></div>
  `);
  // Setup Tile Dragging
  $(`#${id}`)
    .draggable({
      start: function(event) {
        var tile = $(event.target);
        tile.css({
          'box-shadow': '3px 8px 8px rgba(0, 0, 0, 0.5)',
          'z-index': '99',
          'margin-left': '-8px',
          'pointer-events': 'none',
          'border': 'none',
        });
        var idx = pockets.map(function(t) {
          return !!t ? t.attr('id') : false;
        }).indexOf(tile.attr('id'));
        if (idx > -1) {
          pockets[idx] = null;
          $(`#pocket-${idx}`).css({
            'background-image': ``
          });
        }
      },
      stop: function(event) {
        var tile = $(event.target);
        tile.css({
          'box-shadow': '',
          'z-index': '1',
          'margin-left': '0',
          'pointer-events': 'auto',
          'border': 'solid red 3px'
        });
        if (selectedTileSlot !== null) {
          tile.css(
            Object.assign(
              { 'position': 'absolute',
                'border': 'solid green 3px'
              },
              selectedTileSlot.position()
            )
          );
          var idx = selectedTileSlot.data('value');
          pockets[idx] = tile;
          $(`#pocket-${idx}`).css({
            'background-image': `url(assets/${tile.data('value')}-256.png)`,
            'background-size': 'contain',
            'background-repeat': 'no-repeat',
            'background-position': 'center',
          });
        }
      },
    });

  // Add station descriptions to screen into panel
  $('#station-info').append(`
    <div class="columns station-info-item">
      <div class=" ${station} col-2"></div>
      <div class="col-10 station-info-description">
        <p>${stationDescriptions[station]}</p>
      </div>
    </div>
  `)

  // Add station icon to class backgrounds
  $(`.${station}`).css({
    'background-image': `url(assets/${station}-256.png)`,
    'background-size': 'contain',
    'background-repeat': 'no-repeat',
    'background-position': 'center',
  });
}

for(var index in pockets) {
  // TODO: generate html for the pockets based on pockets array
  $('#station-pockets').append(`
    <div id="pocket-${index}" class="pocket col-2">
      <label>${Number(index) + 1}</label>
    </div>
  `)
}

$(`.pocket`).on('click', function(event) {
  console.log('click')
  console.log($(event.target));
  $(event.target).toggleClass('damaged')
})

// Setup resource dice selection mechanism
$('.dice-selector').on('click', function(event){
  var element = $(event.target);
  var value = element.data('value');
  if (!value) {
    value = 1;
  } else if (value === 6) {
    value = 0;
  } else {
    value++;
  }
  element.data('value', value);
  if (value) {
    element.css('background-image', 'url(assets/' + value + '.png)');
  } else {
    element.css('background-image', '');
  }
})

// Setup upgrade selection mechanism
$('.station-upgrade').on('click', function(event){
  var element = $(event.target);
  var value = element.data('value');
  if (!value) {
    value = 1;
  } else if (value === 2) {
    value = 0;
  } else {
    value++;
  }
  element.data('value', value);
  if (value) {
    element.css('background-image', 'url(assets/' + (value === 1 ? 'upgrade' : 'final') + '.png)');
  } else {
    element.css('background-image', '');
  }
})


// === MENU BUTTONS === //

// Board Buttons
var flipped = false;
$('#mb-flip-tiles').on('click', function(event) {
  $('.station-slot').removeClass('flipped');
  flipped = !flipped;
  $('.station-tile').toggleClass('flipped', flipped);
  if (flipped) {
    idxs = pockets.reduce((accumulator, value, i) => (value === null ? [...accumulator, i] : accumulator), []);
    idxs.forEach(idx => {
      $(`#station-slot-${Number(idx) + 1}`).toggleClass('flipped', flipped);
    });
    
  }
});
$('#mb-view-screen').on('click', function(event) {
  $('#game-board').hide()
  $('#game-screen').show()
});

// Screen Buttons
$('#mb-view-board').on('click', function(event) {
  $('#game-screen').hide()
  $('#game-board').show()
});
$('#mb-clear-damage').on('click', function(event) {
  $('.pocket').removeClass('damaged');
});

