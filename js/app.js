/* ==========================================================================
   PREMIUM WEDDING INVITATION INTERACTIVE LOGIC (Vanilla JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CONFIGURATION & STATE
    const STATE = {
        weddingDate: new Date('2026-09-04T15:00:00').getTime(),
        rsvpStorageKey: 'wedding_rsvp_guests',
        tgConfigKey: 'wedding_tg_config',
        googleSheetUrl: 'https://script.google.com/macros/s/AKfycbxf5exEoPCrZCTgsG0mR1-s_VFlpivzMT1pbvkPJO9HnH1pvJaMMIVaMmxGxzP0m7ul/exec',
        guests: []
    };

    // Load initial data
    const loadState = () => {
        const storedGuests = localStorage.getItem(STATE.rsvpStorageKey);
        STATE.guests = storedGuests ? JSON.parse(storedGuests) : [];
    };
    loadState();

    // 2. COUNTDOWN TIMER
    const initCountdown = () => {
        const dSpan = document.getElementById('cd-days');
        const hSpan = document.getElementById('cd-hours');
        const mSpan = document.getElementById('cd-minutes');
        const sSpan = document.getElementById('cd-seconds');

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = STATE.weddingDate - now;

            if (distance < 0) {
                // If date has passed
                dSpan.innerText = '00';
                hSpan.innerText = '00';
                mSpan.innerText = '00';
                sSpan.innerText = '00';
                clearInterval(timerInterval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            dSpan.innerText = String(days).padStart(2, '0');
            hSpan.innerText = String(hours).padStart(2, '0');
            mSpan.innerText = String(minutes).padStart(2, '0');
            sSpan.innerText = String(seconds).padStart(2, '0');
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    };
    initCountdown();

    // 3. SCROLL REVEAL (Intersection Observer)
    const initScrollReveal = () => {
        const revealElements = document.querySelectorAll('.reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Animates once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    };
    initScrollReveal();

    // 4. DRIFTING LEAVES BACKGROUND EFFECT
    const initLeafParticles = () => {
        const container = document.getElementById('particles-container');
        if (!container) return;

        const maxParticles = 15;
        let activeParticles = 0;

        const createParticle = () => {
            if (activeParticles >= maxParticles) return;

            const leaf = document.createElement('div');
            const isGold = Math.random() > 0.6;
            
            leaf.classList.add('leaf-particle');
            if (isGold) {
                leaf.classList.add('gold');
            }

            // Random sizing, delay and position
            const size = Math.random() * 12 + 8; // 8px to 20px
            const startX = Math.random() * window.innerWidth;
            const duration = Math.random() * 8 + 8; // 8s to 16s
            const delay = Math.random() * 2;

            leaf.style.width = `${size}px`;
            leaf.style.height = `${isGold ? size : size * 1.3}px`;
            leaf.style.left = `${startX}px`;
            leaf.style.animationDuration = `${duration}s`;
            leaf.style.animationDelay = `${delay}s`;
            
            // Random initial rotation
            leaf.style.transform = `rotate(${Math.random() * 360}deg)`;

            container.appendChild(leaf);
            activeParticles++;

            // Cleanup when animation ends
            leaf.addEventListener('animationend', () => {
                leaf.remove();
                activeParticles--;
                createParticle();
            });
        };

        // Start spawning
        for (let i = 0; i < 8; i++) {
            setTimeout(createParticle, i * 800);
        }
    };
    initLeafParticles();

    // 5. CLICKABLE DRESSCODE SWATCHES (Copy HEX)
    const initDressCodePalette = () => {
        const swatches = document.querySelectorAll('.color-circle-wrapper');
        const toast = document.getElementById('toast-message');

        swatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const colorHex = swatch.getAttribute('data-color');
                const colorName = swatch.getAttribute('data-name');
                
                navigator.clipboard.writeText(colorHex).then(() => {
                    // Show Toast
                    toast.innerText = `Цвет «${colorName}» (${colorHex}) скопирован!`;
                    toast.classList.add('show');
                    
                    // Hide Toast after 2.5s
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 2500);
                }).catch(err => {
                    console.error('Не удалось скопировать HEX-код: ', err);
                });
            });
        });
    };
    initDressCodePalette();

    // 6. RSVP FORM LOGIC
    const initRsvpForm = () => {
        const rsvpForm = document.getElementById('rsvp-form');
        const successBlock = document.getElementById('rsvp-success-message');
        const attendingDetails = document.getElementById('attending-details');
        const companionRadios = rsvpForm.querySelectorAll('input[name="companion"]');
        const companionNameGroup = document.getElementById('companion-name-group');
        const companionNameInput = document.getElementById('companion-name');
        const submitBtn = document.getElementById('rsvp-submit-btn');

        // Toggle attending detailed fields based on attendance radio value
        rsvpForm.querySelectorAll('input[name="attendance"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'yes') {
                    attendingDetails.classList.remove('hidden');
                    // Add required attributes back to key visible inputs
                    rsvpForm.querySelectorAll('input[name="companion"]').forEach(r => r.required = true);
                } else {
                    attendingDetails.classList.add('hidden');
                    // Remove required attributes to pass browser validation on invisible fields
                    rsvpForm.querySelectorAll('input[name="companion"]').forEach(r => r.required = false);
                    companionNameInput.required = false;
                }
            });
        });

        // Toggle companion name input based on single/couple selection
        companionRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'couple') {
                    companionNameGroup.classList.remove('hidden');
                    companionNameInput.required = true;
                } else {
                    companionNameGroup.classList.add('hidden');
                    companionNameInput.required = false;
                    companionNameInput.value = '';
                }
            });
        });

        // Handle RSVP Form Submission
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.innerText = 'Отправка...';

            const formData = new FormData(rsvpForm);
            
            const attendance = formData.get('attendance');
            const guestName = formData.get('guestName').trim();
            
            let guestData = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                date: new Date().toLocaleString('ru-RU'),
                guestName: guestName,
                attendance: attendance === 'yes' ? 'Приду' : 'Не смогу',
                companion: '—',
                eventParts: '—',
                alcohol: '—',
                foodPrefs: '—',
                shuttle: '—',
                secondDay: '—'
            };

            if (attendance === 'yes') {
                const companionType = formData.get('companion');
                const companionName = formData.get('companionName') ? formData.get('companionName').trim() : '';
                guestData.companion = companionType === 'couple' ? `С парой (${companionName})` : 'Один/Одна';

                // Event Parts Preferences
                guestData.eventParts = formData.get('eventParts') || '—';

                // Alcohol Preferences
                const alcoholChoices = [];
                rsvpForm.querySelectorAll('input[name="alcohol"]:checked').forEach(cb => {
                    alcoholChoices.push(cb.value);
                });
                guestData.alcohol = alcoholChoices.length > 0 ? alcoholChoices.join(', ') : 'Не пью';

                // Food / Allergies
                const foodPrefs = formData.get('foodPrefs').trim();
                guestData.foodPrefs = foodPrefs || 'Нет';

                // Shuttle
                const shuttleVal = formData.get('shuttle');
                const shuttleLabels = {
                    both: 'На торжество и обратно',
                    back: 'Только обратно после банкета',
                    none: 'Приеду самостоятельно'
                };
                guestData.shuttle = shuttleLabels[shuttleVal] || '—';

                // Second Day Attendance
                const secondDayVal = formData.get('secondDay');
                guestData.secondDay = secondDayVal === 'Да' ? 'Буду' : 'Не буду';
            }

            // Save Response locally in LocalStorage
            STATE.guests.push(guestData);
            localStorage.setItem(STATE.rsvpStorageKey, JSON.stringify(STATE.guests));
            
            // Save Response to Google Sheets Database
            if (STATE.googleSheetUrl) {
                try {
                    await fetch(STATE.googleSheetUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(guestData)
                    });
                    console.log('Успешно отправлено в Google Таблицу');
                } catch (err) {
                    console.error('Ошибка отправки в Google Таблицу:', err);
                }
            }
            
            // Refresh administration table if it is active
            populateGuestTable();
            calculateAnalytics();

            // TELEGRAM NOTIFICATION INTEGRATION
            const tgToken = '8508134414:AAFaKgzf9guKb7qvQzkwiIDKKU8iTHpEYco';
            const tgChatId = '1880217045';
            let tgSent = await sendRsvpToTelegram(guestData, tgToken, tgChatId);

            // Show Success screen and trigger confetti
            rsvpForm.classList.add('hidden');
            successBlock.classList.remove('hidden');
            
            if (attendance === 'yes') {
                document.getElementById('success-text').innerHTML = `<strong>${guestName}</strong>, ваше подтверждение получено!`;
            } else {
                document.getElementById('success-text').innerHTML = `<strong>${guestName}</strong>, нам очень жаль, что вы не сможете быть с нами в этот день.`;
            }

            // Roll premium CSS confetti particles
            triggerConfetti();

            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerText = 'Отправить ответ';
        });

        // Edit/Resubmit button click
        document.getElementById('rsvp-edit-btn').addEventListener('click', () => {
            successBlock.classList.add('hidden');
            rsvpForm.classList.remove('hidden');
        });
    };
    initRsvpForm();

    // 7. TELEGRAM BOT SENDER API (With automatic proxy fallback and timeout for reliable operation in Russia)
    const sendRsvpToTelegram = async (guestData, token, chatId) => {
        const textMessage = 
`🔔 *Новый ответ RSVP!*
👤 *Гость:* ${guestData.guestName}
📌 *Присутствие:* ${guestData.attendance}
👥 *Компания:* ${guestData.companion}
🏛️ *Части события:* ${guestData.eventParts}
🍷 *Напитки:* ${guestData.alcohol}
🥩 *Пожелания/Аллергии:* ${guestData.foodPrefs}
🚗 *Трансфер:* ${guestData.shuttle}
🌿 *Второй день:* ${guestData.secondDay}
⏱️ *Время:* ${guestData.date}`;

        const endpoints = [
            `https://api.telegram.org/bot${token}/sendMessage`,
            `https://api.telegram-proxy.org/bot${token}/sendMessage`
        ];

        for (let i = 0; i < endpoints.length; i++) {
            const url = endpoints[i];
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: textMessage,
                        parse_mode: 'Markdown'
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.ok) {
                        console.log(`Успешно отправлено через ${new URL(url).hostname}`);
                        return true;
                    }
                }
            } catch (error) {
                clearTimeout(timeoutId);
                console.warn(`Не удалось отправить через ${new URL(url).hostname}:`, error);
            }
        }

        console.error('Все попытки отправки в Telegram завершились ошибкой.');
        return false;
    };

    // 8. PREMIUM CONFETTI SHOWER EFFECT (Pure JS Canvas-free)
    const triggerConfetti = () => {
        const count = 70;
        const defaults = {
            colors: ['#8D9984', '#C5A880', '#A64B29', '#FAF7F2', '#E2D7C7'],
            shapes: ['circle', 'square']
        };

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            
            // Random properties
            const color = defaults.colors[Math.floor(Math.random() * defaults.colors.length)];
            const shape = defaults.shapes[Math.floor(Math.random() * defaults.shapes.length)];
            const size = Math.random() * 8 + 5; // 5px to 13px
            const left = Math.random() * 100; // 0% to 100%
            const delay = Math.random() * 0.6; // delay in seconds
            const duration = Math.random() * 2 + 1.5; // fall duration
            const rotation = Math.random() * 360;

            piece.style.position = 'fixed';
            piece.style.top = '-20px';
            piece.style.left = `${left}vw`;
            piece.style.width = `${size}px`;
            piece.style.height = `${shape === 'circle' ? size : size * 0.7}px`;
            piece.style.backgroundColor = color;
            piece.style.borderRadius = shape === 'circle' ? '50%' : '2px';
            piece.style.opacity = Math.random() * 0.6 + 0.4;
            piece.style.zIndex = '99999';
            piece.style.pointerEvents = 'none';
            
            // Animation via custom inline keyframe style simulation
            piece.style.transform = `rotate(${rotation}deg)`;
            piece.style.transition = `transform ${duration}s ease-in, top ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            
            document.body.appendChild(piece);

            // Trigger animation in next frame
            requestAnimationFrame(() => {
                setTimeout(() => {
                    piece.style.top = '110vh';
                    piece.style.transform = `rotate(${rotation + Math.random() * 720}deg) translateX(${Math.random() * 80 - 40}px)`;
                }, delay * 1000);
            });

            // Cleanup
            setTimeout(() => {
                piece.remove();
            }, (delay + duration + 0.5) * 1000);
        }
    };

    // 9. SECRET ADMIN DASHBOARD (Activated by ?admin=true in URL)
    const initAdminPanel = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const isAdmin = urlParams.get('admin') === 'true' || window.location.hash === '#admin';
        
        if (!isAdmin) return;

        // Show Admin floating gear trigger button
        const triggerBtn = document.getElementById('admin-trigger-btn');
        const adminPanel = document.getElementById('admin-panel');
        const closeBtn = document.getElementById('admin-close-btn');

        triggerBtn.classList.remove('hidden');

        // Async function to fetch latest guests from Google Sheets
        const syncGuestsWithGoogle = async () => {
            const tbody = document.getElementById('admin-guest-tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding: 2rem; color: var(--text-light);">⏳ Загрузка списка гостей из Google Таблицы...</td></tr>';
            }

            if (!STATE.googleSheetUrl) {
                loadState();
                populateGuestTable();
                calculateAnalytics();
                return;
            }

            try {
                const response = await fetch(STATE.googleSheetUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        STATE.guests = data;
                        localStorage.setItem(STATE.rsvpStorageKey, JSON.stringify(STATE.guests));
                        populateGuestTable();
                        calculateAnalytics();
                        return;
                    }
                }
                throw new Error('Некорректный формат данных');
            } catch (err) {
                console.error('Ошибка загрузки данных из Google Таблиц:', err);
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding: 2rem; color: var(--gold-dark);">⚠️ Ошибка загрузки. Показываем сохраненную локально копию.</td></tr>';
                }
                setTimeout(() => {
                    loadState();
                    populateGuestTable();
                    calculateAnalytics();
                }, 1500);
            }
        };

        // Toggle Dashboard Modal
        triggerBtn.addEventListener('click', () => {
            adminPanel.classList.remove('hidden');
            syncGuestsWithGoogle();
        });

        closeBtn.addEventListener('click', () => {
            adminPanel.classList.add('hidden');
        });

        // Close Admin when clicking background overlay
        adminPanel.addEventListener('click', (e) => {
            if (e.target === adminPanel) {
                adminPanel.classList.add('hidden');
            }
        });

        // Tab Switching Logic
        const tabButtons = document.querySelectorAll('.admin-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Deactivate all
                tabButtons.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

                // Activate clicked
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Export Data to CSV (with UTF-8 BOM so Russian Cyrillic opens beautifully in Microsoft Excel)
        document.getElementById('admin-export-csv').addEventListener('click', () => {
            if (STATE.guests.length === 0) {
                alert('База ответов пока пуста!');
                return;
            }

            let csvContent = '\uFEFF'; // UTF-8 BOM
            csvContent += 'Имя гостя;Присутствие;Пара;Части события;Алкоголь;Пожелания;Трансфер;Второй день;Дата ответа\r\n';

            STATE.guests.forEach(g => {
                const row = [
                    g.guestName,
                    g.attendance,
                    g.companion,
                    g.eventParts || '—',
                    g.alcohol,
                    g.foodPrefs,
                    g.shuttle,
                    g.secondDay || '—',
                    g.date
                ].map(val => `"${(val || '').replace(/"/g, '""')}"`).join(';');
                csvContent += row + '\r\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'wedding_rsvp_guest_list.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Clear Database button
        document.getElementById('admin-clear-all').addEventListener('click', () => {
            alert('Для полной очистки базы данных удалите все строки в вашей Google Таблице (начиная со 2-й строки, оставив 1-ю строку с заголовками столбцов) и обновите эту страницу.');
        });

        // Telegram notifications are hardcoded for direct silent delivery
    };

    // Populate Guest table rows
    const populateGuestTable = () => {
        const tbody = document.getElementById('admin-guest-tbody');
        if (!tbody) return;

        if (STATE.guests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding: 2rem; color: var(--text-light);">Пока никто не ответил на приглашение.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        STATE.guests.forEach((g, index) => {
            const tr = document.createElement('tr');
            
            const isYes = g.attendance === 'Приду';
            const badgeClass = isYes ? 'badge-success' : 'badge-danger';
            
            tr.innerHTML = `
                <td><strong>${escapeHtml(g.guestName)}</strong></td>
                <td><span class="badge ${badgeClass}">${g.attendance}</span></td>
                <td>${escapeHtml(g.companion)}</td>
                <td>${escapeHtml(g.eventParts)}</td>
                <td>${escapeHtml(g.alcohol)}</td>
                <td>${escapeHtml(g.foodPrefs)}</td>
                <td>${escapeHtml(g.shuttle)}</td>
                <td>${escapeHtml(g.secondDay)}</td>
                <td style="color: var(--text-light); font-size: 0.72rem;">${g.date}</td>
                <td class="text-center">
                    <button class="btn-delete-row" data-index="${index}" title="Удалить запись">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to delete buttons
        tbody.querySelectorAll('.btn-delete-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                alert('Редактирование и удаление записей гостей производится напрямую в вашей Google Таблице.\nПросто удалите строку с гостем из таблицы и обновите эту страницу панели управления!');
            });
        });
    };

    // Calculate RSVP Statistics & Analytics
    const calculateAnalytics = () => {
        const totalRsvp = document.getElementById('stat-total-rsvp');
        if (!totalRsvp) return;

        const totalYes = document.getElementById('stat-total-yes');
        const totalNo = document.getElementById('stat-total-no');
        const totalShuttle = document.getElementById('stat-total-shuttle');
        const alcList = document.getElementById('stat-alcohol-list');
        const compList = document.getElementById('stat-companion-list');

        const guestsCount = STATE.guests.length;
        let yesCount = 0;
        let noCount = 0;
        let shuttleCount = 0;

        let alcoholStats = {};
        let companionStats = {
            'Один/Одна': 0,
            'С парой': 0
        };

        STATE.guests.forEach(g => {
            if (g.attendance === 'Приду') {
                yesCount++;
                
                // Shuttle calculation
                if (g.shuttle.includes('На торжество и обратно') || g.shuttle.includes('Только обратно после банкета')) {
                    shuttleCount++;
                }

                // Companion calculation
                if (g.companion.startsWith('С парой')) {
                    companionStats['С парой']++;
                } else {
                    companionStats['Один/Одна']++;
                }

                // Alcohol split
                if (g.alcohol && g.alcohol !== '—' && g.alcohol !== 'Не пью') {
                    g.alcohol.split(', ').forEach(alc => {
                        alcoholStats[alc] = (alcoholStats[alc] || 0) + 1;
                    });
                }
            } else {
                noCount++;
            }
        });

        // Update counts in DOM
        totalRsvp.innerText = guestsCount;
        totalYes.innerText = yesCount;
        totalNo.innerText = noCount;
        totalShuttle.innerText = shuttleCount;

        // Render Alcohol stats list
        if (Object.keys(alcoholStats).length === 0) {
            alcList.innerHTML = '<li><span>Нет данных</span><span>0</span></li>';
        } else {
            alcList.innerHTML = Object.entries(alcoholStats)
                .map(([name, count]) => `<li><span>${escapeHtml(name)}</span><span>${count} чел.</span></li>`)
                .join('');
        }

        // Render Companion list
        compList.innerHTML = `
            <li><span>Придут по одному</span><span>${companionStats['Один/Одна']} чел.</span></li>
            <li><span>Придут парами</span><span>${companionStats['С парой']} чел.</span></li>
        `;
    };

    // Helper: Escape HTML to prevent XSS in admin panel
    const escapeHtml = (str) => {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    initAdminPanel();

});
