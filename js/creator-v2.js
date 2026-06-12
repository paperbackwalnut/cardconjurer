/**
 * creator-v2.js — Phase A shell navigation
 *
 * Handles section switching in the new 3-column creator layout.
 * Does NOT modify creator-23.js or any existing engine functions.
 *
 * Public API:
 *   ccActivateSection(name)  — activate a named panel section
 */

function ccActivateSection(name) {
	// Update sidebar nav item highlight
	document.querySelectorAll('.cc-nav-item').forEach(function (el) {
		el.classList.toggle('cc-nav-active', el.dataset.section === name);
	});

	// Show only the matching panel section
	document.querySelectorAll('.cc-panel-section').forEach(function (el) {
		el.classList.toggle('cc-section-hidden', el.dataset.section !== name);
	});
}

// Activate the default section immediately (DOM is already parsed when defer runs)
ccActivateSection('frame');
