document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Views
  const viewMap = document.getElementById('view-map');
  const viewReport = document.getElementById('view-report');
  const viewFaculty = document.getElementById('view-faculty');
  const btnBack = document.getElementById('btn-back');
  const btnBackFaculty = document.getElementById('btn-back-faculty');
  const btnCancel = document.getElementById('btn-cancel');
  
  // Mobile Sidebar
  const sidebar = document.getElementById('sidebar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  
  // Accordion (Buildings)
  const accordions = document.querySelectorAll('.accordion-header');
  const floorItems = document.querySelectorAll('.floor-item');
  const mapTitle = document.getElementById('map-title');
  const mainMap = document.getElementById('main-map');
  const mainMapBasement = document.getElementById('main-map-basement');
  const mainMapGround = document.getElementById('main-map-ground');
  const mainMapF2 = document.getElementById('main-map-f2');
  const bhawarMap = document.getElementById('bhawar-map');
  const bhawarMap1 = document.getElementById('bhawar-map-1');
  const bhawarMap2 = document.getElementById('bhawar-map-2');
  const bhawarMap3 = document.getElementById('bhawar-map-3');
  const bhawarMap4 = document.getElementById('bhawar-map-4');
  const bhawarMap5 = document.getElementById('bhawar-map-5');
  
  // Map Elements
  const rooms = document.querySelectorAll('.room:not(.stairs-top):not(.stairs-bottom)');
  const bcBuilding = document.getElementById('bc-building');
  const bcFloor = document.getElementById('bc-floor');
  const bcRoom = document.getElementById('bc-room');
  
  // Report Form Elements
  // reportRoomTitle removed — no longer in the DOM
  const issueFormContainer = document.getElementById('issue-form-container');
  const issueCards = document.querySelectorAll('.issue-card');
  const issueDetails = document.getElementById('issue-details');
  const charCount = document.getElementById('char-count');
  const btnSubmit = document.getElementById('btn-submit');
  const toast = document.getElementById('toast');
  
  let currentSelectedRoom = null;
  let selectedIssues = new Set();
  
  let currentBuilding = 'Main Building';
  let currentFloor = 'Floor 1';
  
  const radioStatusInputs = document.querySelectorAll('input[name="room-status"]');

  // --- View Transitions ---
  function showView(viewToShow, viewToHide) {
    viewToHide.classList.remove('active');
    // Small RAF delay ensures CSS transition triggers properly
    requestAnimationFrame(() => {
      viewToShow.classList.add('active');
    });
  }
  
  function openReportView(roomElement) {
    currentSelectedRoom = roomElement;
    const roomName = roomElement.getAttribute('data-room-name');
    if(!roomName) return; // For stairs or empty rooms
    if (
      roomName === 'Lift' ||
      roomName === 'Washroom' ||
      roomName === 'Restrooms' ||
      roomName === 'Stairs' ||
      roomName === 'Student Section' ||
      roomName === 'Library'
    ) return;


    if (roomName === 'Faculty Area') {
      showView(viewFaculty, viewMap);
      return;
    }
    
    // Update breadcrumb pills
    bcRoom.textContent = roomName;
    bcBuilding.textContent = currentBuilding;
    bcFloor.textContent = currentFloor.includes('Floor') ? currentFloor : `Floor ${currentFloor}`;
    
    // Update room type subtitle and icon
    const bcRoomType = document.getElementById('bc-room-type');
    const bcIcon = document.getElementById('bc-icon');
    const inner = roomElement.querySelector('.room-inner');
    let desc = 'Room';
    let icon = 'meeting_room';
    if (inner) {
      if (inner.classList.contains('room-blue')) { desc = 'Computer Lab'; icon = 'desktop_windows'; }
      else if (inner.classList.contains('room-green')) { desc = 'Lab'; icon = 'science'; }
      else if (inner.classList.contains('room-yellow')) { desc = 'Facility'; icon = 'biotech'; }
      else if (inner.classList.contains('room-pink')) { desc = 'Seminar Room'; icon = 'groups'; }
      else if (inner.classList.contains('room-purple')) { desc = 'Classroom'; icon = 'chair'; }
      else if (inner.classList.contains('room-restroom')) { desc = 'Restroom'; icon = 'wc'; }
      else if (inner.classList.contains('room-neutral')) { desc = 'Facility'; icon = 'meeting_room'; }
    }
    if (roomName.startsWith('LH-')) { desc = 'Lecture Hall'; icon = 'class'; }
    if (roomName === 'Lift') { desc = 'Lift'; icon = 'elevator'; }
    else if (roomName === 'Washroom' || roomName === 'Restrooms') { desc = 'Restroom'; icon = 'wc'; }
    if (bcRoomType) bcRoomType.textContent = desc;
    if (bcIcon) bcIcon.textContent = icon;
    
    // Reset Form — default to "Occupied"
    const defaultRadio = document.getElementById('radio-occupied');
    if (defaultRadio) defaultRadio.checked = true;
    
    const sectionSelectIssue = document.getElementById('section-select-issue');
    if (sectionSelectIssue) {
      sectionSelectIssue.style.opacity = '0.5';
      sectionSelectIssue.style.pointerEvents = 'none';
    }
    
    selectedIssues.clear();
    issueCards.forEach(card => card.classList.remove('selected'));
    issueDetails.value = '';
    charCount.textContent = '0';
    btnSubmit.disabled = false; // Always allow submitting status
    
    showView(viewReport, viewMap);
  }
  
  function backToMap() {
    viewReport.classList.remove('active');
    if (viewFaculty) viewFaculty.classList.remove('active');
    requestAnimationFrame(() => {
      viewMap.classList.add('active');
    });
  }
  
  // --- Event Listeners ---
  
  // Sidebar Accordion
  accordions.forEach(acc => {
    acc.addEventListener('click', function() {
      const item = this.parentElement;
      item.classList.toggle('active');
    });
  });

  // Floor Selection
  floorItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active from all
      floorItems.forEach(f => f.classList.remove('active'));
      // Add to clicked
      this.classList.add('active');

      const buildingData = this.closest('.floor-list').getAttribute('data-building');
      const floorData = this.getAttribute('data-floor');
      
      let floorText = floorData === 'G' ? 'Ground Floor' : `Floor ${floorData}`;
      currentFloor = floorText;
      
      if (buildingData === 'Main') {
        currentBuilding = 'Main Building';
        let floorLabel = floorData === 'B' ? 'Basement' : floorData === 'G' ? 'Ground Floor' : `Floor ${floorData}`;
        mapTitle.textContent = `Main Building – ${floorLabel}`;
        currentFloor = floorLabel;

        // Hide all Main Building maps
        mainMap.classList.add('hidden');
        if (mainMapBasement) mainMapBasement.classList.add('hidden');
        if (mainMapGround) mainMapGround.classList.add('hidden');
        if (mainMapF2) mainMapF2.classList.add('hidden');

        // Hide all Bhawar maps
        bhawarMap.classList.add('hidden');
        if (bhawarMap1) bhawarMap1.classList.add('hidden');
        if (bhawarMap2) bhawarMap2.classList.add('hidden');
        if (bhawarMap3) bhawarMap3.classList.add('hidden');
        if (bhawarMap4) bhawarMap4.classList.add('hidden');
        if (bhawarMap5) bhawarMap5.classList.add('hidden');

        // Show the appropriate Main Building map
        if (floorData === 'B') {
          if (mainMapBasement) mainMapBasement.classList.remove('hidden');
        } else if (floorData === 'G') {
          if (mainMapGround) mainMapGround.classList.remove('hidden');
        } else if (floorData === '2') {
          if (mainMapF2) mainMapF2.classList.remove('hidden');
        } else {
          mainMap.classList.remove('hidden'); // Floor 1 (default)
        }
      } else {
        currentBuilding = 'Bhawar Building';
        mapTitle.textContent = `Bhawar Building – ${floorText}`;
        
        // Hide all Main Building maps
        mainMap.classList.add('hidden');
        if (mainMapBasement) mainMapBasement.classList.add('hidden');
        if (mainMapGround) mainMapGround.classList.add('hidden');
        if (mainMapF2) mainMapF2.classList.add('hidden');
        
        // Hide all Bhawar maps initially
        bhawarMap.classList.add('hidden');
        if (bhawarMap1) bhawarMap1.classList.add('hidden');
        if (bhawarMap2) bhawarMap2.classList.add('hidden');
        if (bhawarMap3) bhawarMap3.classList.add('hidden');
        if (bhawarMap4) bhawarMap4.classList.add('hidden');
        if (bhawarMap5) bhawarMap5.classList.add('hidden');
        
        if (floorData === '1') {
          if (bhawarMap1) bhawarMap1.classList.remove('hidden');
        } else if (floorData === '2') {
          if (bhawarMap2) bhawarMap2.classList.remove('hidden');
        } else if (floorData === '3') {
          if (bhawarMap3) bhawarMap3.classList.remove('hidden');
        } else if (floorData === '4') {
          if (bhawarMap4) bhawarMap4.classList.remove('hidden');
        } else if (floorData === '5') {
          if (bhawarMap5) bhawarMap5.classList.remove('hidden');
        } else {
          bhawarMap.classList.remove('hidden'); // Ground floor
        }
        
        // Reset zoom on floor change
        currentZoom = 1;
        applyZoom();
        
        // Apply 3D state to new map if active
        if (is3DMode) {
          const newActiveMap = document.querySelector('.floor-map:not(.hidden)');
          if (newActiveMap) newActiveMap.classList.add('is-3d');
        }
      }
      
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
      }
      
      updateRoomList();
    });
  });

  function updateRoomList() {
    const roomListContainer = document.querySelector('.room-list');
    if (!roomListContainer) return;
    roomListContainer.innerHTML = '';
    
    let activeMap;
    if (!mainMap.classList.contains('hidden')) {
      activeMap = mainMap;
    } else if (mainMapBasement && !mainMapBasement.classList.contains('hidden')) {
      activeMap = mainMapBasement;
    } else if (mainMapGround && !mainMapGround.classList.contains('hidden')) {
      activeMap = mainMapGround;
    } else if (mainMapF2 && !mainMapF2.classList.contains('hidden')) {
      activeMap = mainMapF2;
    } else if (!bhawarMap.classList.contains('hidden')) {
      activeMap = bhawarMap;
    } else if (bhawarMap1 && !bhawarMap1.classList.contains('hidden')) {
      activeMap = bhawarMap1;
    } else if (bhawarMap2 && !bhawarMap2.classList.contains('hidden')) {
      activeMap = bhawarMap2;
    } else if (bhawarMap3 && !bhawarMap3.classList.contains('hidden')) {
      activeMap = bhawarMap3;
    } else if (bhawarMap4 && !bhawarMap4.classList.contains('hidden')) {
      activeMap = bhawarMap4;
    } else if (bhawarMap5 && !bhawarMap5.classList.contains('hidden')) {
      activeMap = bhawarMap5;
    }
    
    if (!activeMap) return;
    
    const roomsInMap = activeMap.querySelectorAll('.room:not(.stairs-top):not(.stairs-bottom)');
    
    roomsInMap.forEach(room => {
      const roomNameAttr = room.getAttribute('data-room-name');
      if (!roomNameAttr || roomNameAttr === 'Stairs' || roomNameAttr === 'Lift') return;
      
      const inner = room.querySelector('.room-inner');
      let colorClass = 'purple';
      let icon = 'meeting_room';
      let desc = 'Room';
      
      if (inner) {
        if (inner.classList.contains('room-blue')) {
          colorClass = 'blue'; icon = 'desktop_windows'; desc = 'Computer Lab';
        } else if (inner.classList.contains('room-green')) {
          colorClass = 'green'; icon = 'science'; desc = 'Lab';
        } else if (inner.classList.contains('room-yellow')) {
          colorClass = 'yellow'; icon = 'biotech'; desc = 'Facility';
        } else if (inner.classList.contains('room-pink')) {
          colorClass = 'pink'; icon = 'groups'; desc = 'Seminar Room';
        } else if (inner.classList.contains('room-restroom')) {
          colorClass = 'blue'; icon = 'wc'; desc = 'Restroom';
        }
        if (roomNameAttr.includes('Classroom') || inner.classList.contains('room-purple')) {
          colorClass = 'purple'; icon = 'chair'; desc = 'Classroom';
        }
      }
      
      let roomNumber = roomNameAttr;
      if (roomNameAttr.includes(' ')) {
        const parts = roomNameAttr.split(' ');
        roomNumber = parts[0];
        desc = parts.slice(1).join(' ');
      } else if (roomNameAttr.startsWith('LH-')) {
        desc = 'Lecture Hall';
      } else if (roomNameAttr.startsWith('B-')) {
        desc = 'Classroom';
      } else if (roomNameAttr === 'Washroom') {
        desc = 'Restroom';
      }
      
      const item = document.createElement('div');
      item.className = 'room-list-item';
      item.innerHTML = `
        <div class="room-icon-box bg-${colorClass}-light">
          <span class="material-icons-round text-${colorClass}">${icon}</span>
        </div>
        <div class="room-info">
          <div class="room-number">${roomNumber}</div>
          <div class="room-desc">${desc}</div>
        </div>
        <span class="material-icons-round chevron-right">chevron_right</span>
      `;
      
      item.addEventListener('click', () => {
        room.click();
      });
      
      roomListContainer.appendChild(item);
    });
  }

  // Initialize room list
  updateRoomList();

  
  // Mobile Sidebar Toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('show');
    });
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('show');
    });
  }
  
  // Room Interactions
  rooms.forEach(room => {
    if(room.id.includes('stair') || room.id.includes('stairs')) return;
    room.addEventListener('click', () => openReportView(room));
  });
  
  // Back & Cancel Buttons
  btnBack.addEventListener('click', backToMap);
  if (btnBackFaculty) btnBackFaculty.addEventListener('click', backToMap);
  btnCancel.addEventListener('click', backToMap);
  
  // Occupancy Toggles
  if (radioStatusInputs.length > 0) {
    radioStatusInputs.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        if (currentSelectedRoom) {
          if (val === 'vacant') {
            currentSelectedRoom.style.border = '2px solid var(--brand-green)';
            const inner = currentSelectedRoom.querySelector('.room-inner');
            if (inner) {
              inner.style.backgroundColor = 'var(--bg-green-light)';
              inner.style.color = 'var(--text-green)';
            }
          } else if (val === 'occupied') {
            currentSelectedRoom.style.border = '2px solid var(--brand-pink)';
            const inner = currentSelectedRoom.querySelector('.room-inner');
            if (inner) {
              inner.style.backgroundColor = 'var(--bg-pink-light)';
              inner.style.color = 'var(--text-pink)';
            }
          } else if (val === 'issue') {
            currentSelectedRoom.style.border = '2px solid var(--brand-yellow)';
            const inner = currentSelectedRoom.querySelector('.room-inner');
            if (inner) {
              inner.style.backgroundColor = 'var(--bg-yellow-light)';
              inner.style.color = 'var(--text-yellow)';
            }
          }
        }
        
        // Disable/enable issue section
        const sectionSelectIssue = document.getElementById('section-select-issue');
        if (sectionSelectIssue) {
          if (val === 'issue') {
             sectionSelectIssue.style.opacity = '1';
             sectionSelectIssue.style.pointerEvents = 'auto';
          } else {
             sectionSelectIssue.style.opacity = '0.5';
             sectionSelectIssue.style.pointerEvents = 'none';
          }
        }
      });
    });
  }
  
  // Theme Toggle Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('.material-icons-round') : null;
  
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.textContent = 'light_mode';
  }
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.textContent = 'dark_mode';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.textContent = 'light_mode';
      }
    });
  }
  
  // Zoom Logic
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const resetZoomBtn = document.getElementById('reset-zoom');
  let currentZoom = 1;
  const zoomStep = 0.2;
  const maxZoom = 3;
  const minZoom = 0.5;

  function applyZoom() {
    const activeMap = document.querySelector('.floor-map:not(.hidden)');
    if (activeMap) {
      activeMap.style.transform = `scale(${currentZoom})`;
      activeMap.style.transformOrigin = 'center center';
      activeMap.style.transition = 'transform 0.3s ease';
    }
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        applyZoom();
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        applyZoom();
      }
    });
  }

  if (resetZoomBtn) {
    resetZoomBtn.addEventListener('click', () => {
      currentZoom = 1;
      applyZoom();
    });
  }
  
  // 3D View Logic
  const view3dBtn = document.getElementById('view-3d-btn');
  const mapContainer = document.querySelector('.map-container');
  let is3DMode = false;
  
  if (view3dBtn) {
    view3dBtn.addEventListener('click', () => {
      is3DMode = !is3DMode;
      const activeMap = document.querySelector('.floor-map:not(.hidden)');
      
      if (is3DMode) {
        view3dBtn.classList.replace('btn-primary', 'btn-outline');
        view3dBtn.querySelector('.btn-text').textContent = 'Exit 3D';
        if (mapContainer) mapContainer.classList.add('is-3d');
        if (activeMap) activeMap.classList.add('is-3d');
        
        // Reset zoom to 1 when entering 3D to prevent scaling issues
        currentZoom = 1;
        applyZoom();
      } else {
        view3dBtn.classList.replace('btn-outline', 'btn-primary');
        view3dBtn.querySelector('.btn-text').textContent = 'View 3D';
        if (mapContainer) mapContainer.classList.remove('is-3d');
        if (activeMap) activeMap.classList.remove('is-3d');
      }
    });
  }
  
  // Search Logic
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (searchInput && searchResults) {
    // Helper to get floor info
    function getFloorInfo(room) {
      const map = room.closest('.floor-map');
      if (!map) return { building: '', floor: '' };
      
      let building = 'Unknown';
      let floor = '';

      if (map.classList.contains('main-map-basement')) { building = 'Main Building'; floor = 'Basement'; }
      else if (map.classList.contains('main-map-ground')) { building = 'Main Building'; floor = 'Ground Floor'; }
      else if (map.classList.contains('main-map-f2')) { building = 'Main Building'; floor = 'Floor 2'; }
      else if (map.id === 'main-map') { building = 'Main Building'; floor = 'Floor 1'; }
      else if (map.id === 'bhawar-map') { building = 'Bhawar Building'; floor = 'Ground Floor'; }
      else if (map.classList.contains('bhawar-map-1')) { building = 'Bhawar Building'; floor = 'Floor 1'; }
      else if (map.classList.contains('bhawar-map-2')) { building = 'Bhawar Building'; floor = 'Floor 2'; }
      else if (map.classList.contains('bhawar-map-3')) { building = 'Bhawar Building'; floor = 'Floor 3'; }
      else if (map.classList.contains('bhawar-map-4')) { building = 'Bhawar Building'; floor = 'Floor 4'; }
      else if (map.classList.contains('bhawar-map-5')) { building = 'Bhawar Building'; floor = 'Floor 5'; }

      return { building, floor };
    }

    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const allRooms = document.querySelectorAll('.room');
      
      // Clear previous results
      searchResults.innerHTML = '';
      
      if (searchTerm === '') {
        searchResults.classList.add('hidden');
        allRooms.forEach(room => room.classList.remove('highlight-pulse'));
        return;
      }
      
      searchResults.classList.remove('hidden');
      
      let matchCount = 0;
      allRooms.forEach(room => {
        const roomName = (room.dataset.roomName || '').toLowerCase();
        if (roomName.includes(searchTerm)) {
          room.classList.add('highlight-pulse');
          matchCount++;
          
          // Create result item
          const info = getFloorInfo(room);
          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.innerHTML = `
            <div class="search-result-name">${room.dataset.roomName || 'Unknown Room'}</div>
            <div class="search-result-location">
              <span class="material-icons-round" style="font-size: 14px;">place</span>
              ${info.building} • ${info.floor}
            </div>
          `;
          
          // Click to navigate
          item.addEventListener('click', () => {
             // Find the corresponding sidebar floor item and click it!
             let queryFloor = info.floor.replace('Floor ', '');
             if (info.floor === 'Ground Floor') queryFloor = 'G';
             if (info.floor === 'Basement') queryFloor = 'B';
             
             let buildingId = info.building === 'Main Building' ? 'Main' : 'Bhawar';
             
             const floorItemToClick = document.querySelector(`.floor-list[data-building="${buildingId}"] .floor-item[data-floor="${queryFloor}"]`);
             
             if (floorItemToClick) {
               // Ensure the accordion is open
               const accordionBody = floorItemToClick.closest('.accordion-body');
               const accordionItem = floorItemToClick.closest('.accordion-item');
               if (accordionItem && !accordionItem.classList.contains('active')) {
                 accordionItem.querySelector('.accordion-header').click();
               }
               
               // Click the floor
               floorItemToClick.click();
             }
             
             // Hide search results
             searchResults.classList.add('hidden');
             searchInput.value = '';
          });
          
          searchResults.appendChild(item);
        } else {
          room.classList.remove('highlight-pulse');
        }
      });
      
      if (matchCount === 0) {
        searchResults.innerHTML = `<div class="search-result-empty">No matching rooms found</div>`;
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        searchResults.classList.add('hidden');
      }
    });
  }
  
  // Keyboard Shortcut (Cmd+K / Ctrl+K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // Removed old issue toggle logic
  
  // Form Logic: Issue Cards Multi-select
  issueCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedRadio = document.querySelector('input[name="room-status"]:checked');
      if (!selectedRadio || selectedRadio.value !== 'issue') return;
      
      const issueName = card.getAttribute('data-issue');
      if (selectedIssues.has(issueName)) {
        selectedIssues.delete(issueName);
        card.classList.remove('selected');
      } else {
        selectedIssues.add(issueName);
        card.classList.add('selected');
      }
      updateSubmitButton();
    });
  });
  
  // Form Logic: Textarea Counter
  issueDetails.addEventListener('input', (e) => {
    const length = e.target.value.length;
    charCount.textContent = length;
    updateSubmitButton();
  });
  
  function updateSubmitButton() {
    btnSubmit.disabled = false; // Always allow submit with new UI
  }
  
  // Form Logic: Submit Report
  function doSubmitReport() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
    backToMap();
  }

  btnSubmit.addEventListener('click', doSubmitReport);

  // Mobile sticky submit button
  const btnSubmitMobile = document.getElementById('btn-submit-mobile');
  if (btnSubmitMobile) {
    btnSubmitMobile.addEventListener('click', doSubmitReport);
  }

  // Show/hide sticky bar based on active view
  const stickyBar = document.querySelector('.sticky-submit-bar');
  function updateStickyBar() {
    if (!stickyBar) return;
    if (viewReport.classList.contains('active')) {
      stickyBar.style.display = 'block';
    } else {
      stickyBar.style.display = 'none';
    }
  }

  // Override showView to also update sticky bar
  const originalShowView = showView;
  function showViewWithStickyUpdate(viewToShow, viewToHide) {
    viewToHide.classList.remove('active');
    requestAnimationFrame(() => {
      viewToShow.classList.add('active');
      updateStickyBar();
    });
  }

  // Patch openReportView to use updated function
  rooms.forEach(room => {
    if (room.id.includes('stairs')) return;
    // Already bound above; we re-add the sticky update after view switch
  });

  // Observe class changes on viewReport to toggle sticky bar
  const reportObserver = new MutationObserver(updateStickyBar);
  reportObserver.observe(viewReport, { attributes: true, attributeFilter: ['class'] });
  updateStickyBar();
  
  // Legend Modal Logic
  const legendBtn = document.getElementById('legend-btn');
  const legendModal = document.getElementById('legend-modal');
  const closeLegendBtns = document.querySelectorAll('.close-legend');

  if (legendBtn && legendModal) {
    legendBtn.addEventListener('click', () => {
      legendModal.classList.add('active');
    });

    closeLegendBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        legendModal.classList.remove('active');
      });
    });

    // Close when clicking outside modal content
    legendModal.addEventListener('click', (e) => {
      if (e.target === legendModal) {
        legendModal.classList.remove('active');
      }
    });
  }
});
