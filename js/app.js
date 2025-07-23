// Get references to DOM elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const generateTaskBtn = document.getElementById('generateTaskBtn'); // Renamed from suggestTasksBtn
const nextTaskBtn = document.getElementById('nextTaskBtn');
const taskList = document.getElementById('taskList');
const genreRadios = document.querySelectorAll('input[name="genre"]'); // Get all genre radio buttons

// Key for localStorage
const STORAGE_KEY = 'simpleTodoAppTasks';

// --- Suggested Tasks by Genre ---
const allSuggestedTasks = {
    movie: [
        "Watch a classic film",
        "Explore a new movie genre",
        "Watch a documentary about filmmaking",
        "Re-watch a favorite movie",
        "Discover a film from a different country",
        "Read movie reviews for an upcoming film",
        "Plan a movie night with friends",
        "Watch a movie based on a book",
        "Learn about a famous director's work",
        "List your top 5 favorite movies",
        "Watch a movie nominated for an award",
        "Try to identify movie tropes",
        "Listen to a film score album",
        "Watch a silent film",
        "Explore animated films from different eras",
        "Watch a short film online",
        "Research movie special effects",
        "Watch a film adaptation of a play",
        "Find a movie filmed in your city/country",
        "Write a short movie review"
    ],
    food: [
        "Try a new recipe for dinner",
        "Bake something sweet (cookies, cake)",
        "Plan a healthy meal for the week",
        "Experiment with a new spice or herb",
        "Cook a dish from a different cuisine",
        "Visit a local farmers' market",
        "Meal prep for the next few days",
        "Learn a basic cooking technique (e.g., chopping onions)",
        "Make homemade bread or pasta",
        "Try a new fruit or vegetable",
        "Organize your pantry/fridge",
        "Prepare a picnic lunch",
        "Make a smoothie with new ingredients",
        "Research food preservation methods",
        "Try a new type of coffee or tea",
        "Cook a dish with only 3 ingredients",
        "Learn about sustainable eating",
        "Host a small potluck with friends",
        "Make a homemade sauce or dressing",
        "Create a grocery list based on recipes"
    ],
    travel: [
        "Research a dream travel destination",
        "Plan a local day trip or outing",
        "Learn a few basic phrases in a new language",
        "Create a travel bucket list",
        "Watch a travel documentary",
        "Look up historical sites in your region",
        "Plan a hypothetical road trip",
        "Read a travel blog about a place you want to visit",
        "Learn about a new culture's customs",
        "Find unique accommodations (e.g., treehouse, houseboat)",
        "Research budget travel tips",
        "Explore virtual tours of famous landmarks",
        "Plan an outdoor adventure (hiking, camping)",
        "Find local hidden gems in your city",
        "Learn about travel photography tips",
        "Research visa requirements for a country",
        "Create a travel savings plan",
        "Discover local festivals or events",
        "Read a book set in a foreign country",
        "Pack a hypothetical travel bag efficiently"
    ]
};

// State variables for genre suggestions
let currentGenre = 'movie'; // Default selected genre
let availableSuggestions = []; // Tasks available to be suggested for the current genre

// --- Functions ---

/**
 * Loads tasks from localStorage and renders them.
 */
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    tasks.forEach(task => renderTask(task.text, task.completed));
    // Set the initial genre and reset suggestions based on it
    const savedGenre = localStorage.getItem('selectedGenre') || 'movie';
    document.querySelector(`input[name="genre"][value="${savedGenre}"]`).checked = true;
    currentGenre = savedGenre;
    resetSuggestions();
}

/**
 * Saves the current state of tasks to localStorage.
 */
function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        tasks.push({
            text: li.querySelector('.task-text').textContent,
            completed: li.classList.contains('completed')
        });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem('selectedGenre', currentGenre); // Save selected genre
}

/**
 * Renders a single task item to the DOM.
 * @param {string} taskText - The text content of the task.
 * @param {boolean} isCompleted - Whether the task is initially completed.
 */
function renderTask(taskText, isCompleted = false) {
    if (!taskText.trim()) { // Prevent adding empty tasks
        return;
    }

    const listItem = document.createElement('li');

    // Create span for task text
    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskText;
    taskSpan.classList.add('task-text');
    listItem.appendChild(taskSpan);

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    listItem.appendChild(deleteButton);

    // Apply 'completed' class if needed
    if (isCompleted) {
        listItem.classList.add('completed');
    }

    taskList.appendChild(listItem); // Add the new task to the list
}

/**
 * Handles adding a new task.
 */
function addTask() {
    const text = taskInput.value;
    renderTask(text); // Render the new task
    taskInput.value = ''; // Clear the input field
    saveTasks(); // Save tasks to localStorage
    resetSuggestions(); // Re-evaluate available suggestions after manual add
}

/**
 * Handles clicking on a task item (to toggle completion or delete).
 * Uses event delegation for efficiency.
 * @param {Event} event - The click event object.
 */
function handleTaskClick(event) {
    const clickedElement = event.target;
    const listItem = clickedElement.closest('li'); // Find the parent <li>

    if (!listItem) return; // If click wasn't inside an <li>, do nothing

    if (clickedElement.classList.contains('task-text')) {
        // Toggle 'completed' class on the li item
        listItem.classList.toggle('completed');
        saveTasks(); // Save updated state
    } else if (clickedElement.classList.contains('delete-btn')) {
        // Remove the list item from the DOM
        listItem.remove();
        saveTasks(); // Save updated state
        resetSuggestions(); // Re-evaluate available suggestions after deletion
    }
}

/**
 * Resets the availableSuggestions array based on tasks currently in the list
 * for the current genre. Also manages button visibility.
 */
function resetSuggestions() {
    const existingTasks = Array.from(taskList.querySelectorAll('li .task-text'))
                              .map(span => span.textContent);
    
    // Filter tasks from the current genre's full list
    availableSuggestions = allSuggestedTasks[currentGenre].filter(task => !existingTasks.includes(task));

    updateSuggestionButtonVisibility();
}

/**
 * Updates the visibility and disabled state of the suggestion buttons.
 */
function updateSuggestionButtonVisibility() {
    if (availableSuggestions.length === 0) {
        generateTaskBtn.style.display = 'inline-block'; // Show generate to indicate no more
        generateTaskBtn.disabled = true;
        generateTaskBtn.textContent = 'No More Suggestions';
        nextTaskBtn.style.display = 'none';
    } else {
        generateTaskBtn.disabled = false;
        generateTaskBtn.textContent = 'Generate Task'; // Reset text
        // If there are suggestions, show generate initially, hide next
        // After first click, generate hides, next shows
        if (availableSuggestions.length === allSuggestedTasks[currentGenre].length) {
            generateTaskBtn.style.display = 'inline-block';
            nextTaskBtn.style.display = 'none';
        } else {
            generateTaskBtn.style.display = 'none';
            nextTaskBtn.style.display = 'inline-block';
        }
    }
}


/**
 * Adds one random suggested task from the available suggestions to the list.
 */
function addOneSuggestedTask() {
    if (availableSuggestions.length === 0) {
        // In a real app, use a custom modal instead of alert
        alert("No more unique suggestions available for this genre!");
        updateSuggestionButtonVisibility(); // Ensure buttons are disabled/hidden
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableSuggestions.length);
    const taskToAdd = availableSuggestions[randomIndex];

    renderTask(taskToAdd); // Add the task to the DOM
    saveTasks(); // Save the updated list

    // Remove the added task from available suggestions
    availableSuggestions.splice(randomIndex, 1);

    updateSuggestionButtonVisibility(); // Update button states after adding
}


// --- Event Listeners ---

// Add task when the button is clicked
addTaskBtn.addEventListener('click', addTask);

// Add task when Enter key is pressed in the input field
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Event listener for genre radio button changes
genreRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        currentGenre = event.target.value;
        resetSuggestions(); // Reset suggestions based on the new genre
        saveTasks(); // Save the newly selected genre
    });
});

// "Generate Task" button click
generateTaskBtn.addEventListener('click', addOneSuggestedTask);

// "Next Task" button click
nextTaskBtn.addEventListener('click', addOneSuggestedTask);


// Use event delegation on the ul for toggling completion and deleting tasks
taskList.addEventListener('click', handleTaskClick);

// Load tasks when the page first loads
document.addEventListener('DOMContentLoaded', loadTasks);
