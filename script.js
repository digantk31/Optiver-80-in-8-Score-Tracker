const form = document.getElementById('score-form');
const scoreList = document.getElementById('score-list');
const barChartContext = document.getElementById('barChart').getContext('2d');
const lineChartContext = document.getElementById('lineChart').getContext('2d');
const scoreDateInput = document.getElementById('score-date');

let scores = [];
let editingIndex = null;
let barChart; // Variable for bar chart
let lineChart; // Variable for line chart

// Load scores from localStorage
if (localStorage.getItem('scores')) {
    scores = JSON.parse(localStorage.getItem('scores'));
}

// Set default date after DOM has fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Remove this code if you don't want any default date set
    // const today = new Date().toISOString().split('T')[0];
    // scoreDateInput.value = today;
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const date = scoreDateInput.value;
    const value = parseFloat(document.getElementById('score-value').value); // Ensure the value is a number

    // Check for duplicate entry
    const existingEntry = scores.find(score => score.date === date);
    if (existingEntry && editingIndex === null) {
        showModal(`A score for ${date} already exists. Please edit the existing entry instead.`);
        return; // Prevent adding a new score
    }

    // Validate the score
    if (value > 80) {
        showModal('Score cannot be more than 80. Please enter a valid score.');
        return; // Prevent form submission if score is greater than 80
    }

    if (editingIndex !== null) {
        // Update existing score
        scores[editingIndex] = { date, value };
        editingIndex = null; // Reset edit index
    } else {
        // Add new score
        scores.push({ date, value });
    }

    localStorage.setItem('scores', JSON.stringify(scores));
    renderScores();
    updateCharts();
    form.reset();
    const today = new Date().toISOString().split('T')[0];
    scoreDateInput.value = today; // Reset date to today after submission
});

// Render scores in the list
function renderScores() {
    scoreList.innerHTML = '';

    // Sort scores in descending order by date for the list
    scores.sort((a, b) => new Date(b.date) - new Date(a.date));

    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${score.date}: ${score.value}`;

        // Create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-btn');
        editButton.addEventListener('click', () => {
            document.getElementById('score-value').value = score.value;
            scoreDateInput.value = score.date;
            editingIndex = index; // Set editing index
        });

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            scores.splice(index, 1);
            localStorage.setItem('scores', JSON.stringify(scores));
            renderScores();
            updateCharts();
        });

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        scoreList.appendChild(li);
    });
}

// Update the charts (Bar chart and Line chart)
function updateCharts() {
    // Sort scores in ascending order by date for charts
    const sortedScores = [...scores].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedScores.map(score => score.date);
    const data = sortedScores.map(score => score.value);

    // Bar Chart (Sorted in ascending order)
    if (barChart) {
        barChart.destroy(); // Destroy only if it exists
    }

    barChart = new Chart(barChartContext, {
        type: 'bar',
        data: {
            labels: labels, // Sorted in ascending order
            datasets: [{
                label: 'Daily Scores (Bar)',
                data: data, // Sorted in ascending order
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });

    // Dotted Line Chart (Sorted in ascending order)
    if (lineChart) {
        lineChart.destroy(); // Destroy only if it exists
    }

    lineChart = new Chart(lineChartContext, {
        type: 'line',
        data: {
            labels: labels, // Sorted in ascending order
            datasets: [{
                label: 'Daily Scores (Dotted Line)',
                data: data, // Sorted in ascending order
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true,
                borderDash: [5, 5], // Dotted line
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// Function to show the modal
function showModal(message) {
    const modal = document.getElementById("modal");
    const modalMessage = document.getElementById("modal-message");
    modalMessage.textContent = message;
    modal.style.display = "block";

    // Close the modal when the user clicks on <span> (x)
    const span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Close the modal when the user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

// Initial render
renderScores();
updateCharts();
