document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Views
  const viewMap = document.getElementById('view-map');
  const viewReport = document.getElementById('view-report');
  const btnBack = document.getElementById('btn-back');
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
  const reportRoomTitle = document.getElementById('report-room-title');
  const issueToggle = document.getElementById('issue-toggle');
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
  
  const btnVacant = document.getElementById('btn-vacant');
  const btnOccupied = document.getElementById('btn-occupied');

  // --- View Transitions ---
  function showView(viewToShow, viewToHide) {
    viewToHide.classList.remove('active');
    setTimeout(() => {
      viewToShow.classList.add('active');
    }, 50);
  }
  
  function openReportView(roomElement) {
    currentSelectedRoom = roomElement;
    const roomName = roomElement.getAttribute('data-room-name');
    if(!roomName) return; // For stairs or empty rooms
    
    // Update header
    reportRoomTitle.textContent = roomName;
    bcRoom.textContent = roomName;
    bcBuilding.textContent = currentBuilding;
    bcFloor.textContent = currentFloor.includes('Floor') ? currentFloor : `Floor ${currentFloor}`;
    
    // Reset Form
    issueToggle.checked = false;
    issueFormContainer.classList.add('disabled');
    selectedIssues.clear();
    issueCards.forEach(card => card.classList.remove('selected'));
    issueDetails.value = '';
    charCount.textContent = '0';
    btnSubmit.disabled = true;
    
    showView(viewReport, viewMap);
  }
  
  function backToMap() {
    showView(viewMap, viewReport);
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
        mapTitle.textContent = `Main Building – ${floorText}`;
        mainMap.classList.remove('hidden');
        bhawarMap.classList.add('hidden');
        if (bhawarMap1) bhawarMap1.classList.add('hidden');
        if (bhawarMap2) bhawarMap2.classList.add('hidden');
        if (bhawarMap3) bhawarMap3.classList.add('hidden');
        if (bhawarMap4) bhawarMap4.classList.add('hidden');
        if (bhawarMap5) bhawarMap5.classList.add('hidden');
      } else {
        currentBuilding = 'Bhawar Building';
        mapTitle.textContent = `Bhawar Building – ${floorText}`;
        mainMap.classList.add('hidden');
        
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
    if(room.id.includes('stairs')) return;
    room.addEventListener('click', () => openReportView(room));
  });
  
  // Back & Cancel Buttons
  btnBack.addEventListener('click', backToMap);
  btnCancel.addEventListener('click', backToMap);
  
  // Occupancy Toggles
  if (btnVacant && btnOccupied) {
    btnVacant.addEventListener('click', () => {
      btnVacant.classList.add('active');
      btnOccupied.classList.remove('active');
    });
    btnOccupied.addEventListener('click', () => {
      btnOccupied.classList.add('active');
      btnVacant.classList.remove('active');
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
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const allRooms = document.querySelectorAll('.room');
      
      if (searchTerm === '') {
        // Reset all highlights
        allRooms.forEach(room => room.classList.remove('highlight-pulse'));
        return;
      }
      
      allRooms.forEach(room => {
        const roomName = (room.dataset.roomName || '').toLowerCase();
        if (roomName.includes(searchTerm)) {
          room.classList.add('highlight-pulse');
        } else {
          room.classList.remove('highlight-pulse');
        }
      });
    });
  }
  
  // Keyboard Shortcut (Cmd+K / Ctrl+K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // Form Logic: Issue Toggle Switch
  issueToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      issueFormContainer.classList.remove('disabled');
      updateSubmitButton();
    } else {
      issueFormContainer.classList.add('disabled');
      btnSubmit.disabled = true;
    }
  });
  
  // Form Logic: Issue Cards Multi-select
  issueCards.forEach(card => {
    card.addEventListener('click', () => {
      if (!issueToggle.checked) return;
      
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
    if (selectedIssues.size > 0 || issueDetails.value.trim().length > 0) {
      btnSubmit.disabled = false;
    } else {
      btnSubmit.disabled = true;
    }
  }
  
  // Form Logic: Submit Report
  btnSubmit.addEventListener('click', () => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
    
    if (currentSelectedRoom) {
      // Mock issue styling
      currentSelectedRoom.style.border = '2px solid var(--brand-pink)';
    }
    backToMap();
  });
  
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
