let targetElement = null;
let intercepted = false;
let lastSequentialClickTime = 0; // 마지막 순차 클릭 시간

// 0.2초마다 target 요소 감지
const detectInterval = setInterval(() => {
    const saveAsProjectDiv = document.querySelector('div[value="saveAsProject"]');
    
    if (saveAsProjectDiv && saveAsProjectDiv !== targetElement) {
        targetElement = saveAsProjectDiv;
        
        // 클릭 이벤트 가로채기
        saveAsProjectDiv.addEventListener('click', function(e) {
            // 최근 1초 이내의 순차 클릭이면 가로채지 않음
            const now = Date.now();
            if (now - lastSequentialClickTime < 1000) {
                console.log('최근 순차 클릭이므로 가로채기 건너뜀');
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            intercepted = true;
            showConfirmModal();
            return false;
        }, true);
        
        console.log('saveAsProject div detected and intercepted');
    }
}, 200);

function showConfirmModal() {
    // 기존 모달이 있다면 제거
    const existingModal = document.getElementById('EntryModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 모달 HTML 생성
    const modalHTML = `
        <div id="EntryModal" class="entry-modal-modal">
            <div class="entry-modal-box">
                <div class="entry-modal-confirm">
                    <div class="entry-modal-title">
                        <div class="entry-modal-entryLmsText">복사본으로 저장하기</div>
                        <div class="entry-modal-button entry-modal-entryLmsClose" data-value="close"></div>
                    </div>
                    <div class="entry-modal-contentView">
                        <div class="entry-modal-content">
                            <div>복사본으로 저장하면 기존 작품에는 변경 사항이 반영되지 않습니다.</div>
                            <br>
                            <div>복사본으로 저장하시겠습니까?</div>
                        </div>
                        <div class="entry-modal-button-group">
                            <button class="entry-modal-button entry-modal-cancelButton" type="button">아니요</button>
                            <button class="entry-modal-button entry-modal-confirmButton" type="button">예</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('EntryModal');
    const confirmBtn = modal.querySelector('.entry-modal-confirmButton');
    const cancelBtn = modal.querySelector('.entry-modal-cancelButton');
    const closeBtn = modal.querySelector('.entry-modal-entryLmsClose');
    
    // 예 버튼
    confirmBtn.onclick = function() {
        console.log('예 버튼 클릭됨 - 순차 클릭 시작');
        closeModal();
        
        // 0.05초 기다린 후 순차 클릭
        setTimeout(() => {
            executeSequentialClicks();
        }, 50);
    };
    
    // 아니요 버튼
    cancelBtn.onclick = function() {
        console.log('아니요 버튼 클릭됨');
        closeModal();
    };
    
    // 닫기 버튼
    closeBtn.onclick = function() {
        console.log('닫기 버튼 클릭됨');
        closeModal();
    };
    
    // 모달 외부 클릭시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function executeSequentialClicks() {
    console.log('순차 클릭 실행 시작');
    
    // 1단계: save 버튼 찾아서 클릭
    const saveButton = document.querySelector('button[type="button"].css-9qnihu.e182ojvz1');
    if (saveButton) {
        console.log('save 버튼 찾음, 클릭 실행');
        saveButton.click();
        
        // 짧은 지연 후 2단계 실행
        setTimeout(() => {
            // 순차 클릭 시간 기록
            lastSequentialClickTime = Date.now();
            
            // 2단계: saveAsProject div 클릭
            const saveAsProjectDiv = document.querySelector('div[value="saveAsProject"]');
            if (saveAsProjectDiv) {
                console.log('saveAsProject div 찾음, 클릭 실행 (타임스탬프 기록됨)');
                saveAsProjectDiv.click();
                console.log('순차 클릭 완료');
                
                // 다시 감지 시작
                setTimeout(() => {
                    const nextTarget = document.querySelector('div[value="saveAsProject"]');
                    if (nextTarget) {
                        targetElement = nextTarget;
                        setupInterceptor(nextTarget);
                        console.log('다시 가로채기 설정 완료');
                    }
                }, 1000);
                
            } else {
                console.error('saveAsProject div를 찾을 수 없음');
            }
        }, 100);
        
    } else {
        console.error('save 버튼을 찾을 수 없음');
        
        // save 버튼이 없으면 바로 saveAsProject div 클릭 시도
        lastSequentialClickTime = Date.now(); // 타임스탬프 기록
        
        const saveAsProjectDiv = document.querySelector('div[value="saveAsProject"]');
        if (saveAsProjectDiv) {
            console.log('save 버튼 없음, saveAsProject div 직접 클릭 (타임스탬프 기록됨)');
            saveAsProjectDiv.click();
            
            setTimeout(() => {
                const nextTarget = document.querySelector('div[value="saveAsProject"]');
                if (nextTarget) {
                    targetElement = nextTarget;
                    setupInterceptor(nextTarget);
                }
            }, 1000);
        }
    }
}

function setupInterceptor(element) {
    element.addEventListener('click', function(e) {
        // 최근 1초 이내의 순차 클릭이면 가로채지 않음
        const now = Date.now();
        if (now - lastSequentialClickTime < 1000) {
            console.log('최근 순차 클릭이므로 가로채기 건너뜀');
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        intercepted = true;
        showConfirmModal();
        return false;
    }, true);
}

function closeModal() {
    const modal = document.getElementById('EntryModal');
    if (modal) {
        modal.remove();
    }
    intercepted = false;
}

// 페이지 언로드 시 interval 정리
window.addEventListener('beforeunload', () => {
    if (detectInterval) {
        clearInterval(detectInterval);
    }
}); 