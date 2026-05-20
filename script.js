var task = document.getElementById('taskInput');
var priority = document.getElementById('prioritySelect');
var btnAdd = document.getElementById('addBtn');
var container = document.getElementById('tasksContainer');
var btnFilter = document.getElementById('filter-btn');
var total = document.getElementById('totalCount');
var alta = document.getElementById('altaCount');
var media = document.getElementById('mediaCount');
var baixa = document.getElementById('baixaCount');
var error = document.getElementById('mostrarErro');

var farmers = [];
var searchTerm = '';

function addFarmer(){
    var name = document.getElementById('farmerName').value.trim();
    var cnpj = document.getElementById('farmerCnpj').value.trim();
    var farmName = document.getElementById('farmName').value.trim();

    if(name === ''){
        alert('Digite o nome do produtor!');
        return;
    }

    if(cnpj === ''){
        alert('Digite o CNPJ do produtor!');
        return;
    }

    if(cnpj.length !== 14 || isNaN(cnpj)){
        alert('CNPJ Inválido! Digite 14 números (apenas digitos)');
        return;
    }

    if(farmName === ''){
        alert('Digite o nome da propriedade!');
        return;
    }

    for(var i = 0; i < farmers.length; i++){ 
        if(farmers[i].cnpj === cnpj){
            alert('Este CNPJ já está cadastrado!');
            return;
        }
    }

    var newFarmer = {
        id: Date.now(),
        name: name,
        cnpj: cnpj,
        farmName: farmName,
        declaration: false
    };

    farmers.push(newFarmer);

    document.getElementById('farmerName').value = '';
    document.getElementById('farmerCnpj').value = '';
    document.getElementById('farmName').value = '';

    sortFarmersByName();
    renderFarmers();
    saveFarmersToLocalStorage();

}

function sortFarmersByName(){
    farmers.sort(function(a,b) { 
        var nomeA = a.name.toLowerCase();
        var nomeB = b.name.toLowerCase();

        if(nomeA < nomeB) return -1;
        if(nomeA > nomeB) return 1;
        return 0;
    })
}

function toggleDeclaration(id){
    for(var i = 0; i <farmers.length; i++){
        if(farmers[i].id === id){
            farmers[i].declaration = !farmers[i].declaration;
            break;
        }
    }

    renderFarmers();
    saveFarmersToLocalStorage();
}

function deleteFarmer(id){
    var confirmar = confirm('Tem certeza que deseja excluir este produtor?');

    if(!confirmar) return;

    farmers = farmers.filter(function(farmer) {
        return farmer.id !== id;
    });

    renderFarmers();
    saveFarmersToLocalStorage();
}

function editFarmer(id){
    var farmer = null;

    for(var i = 0; i < farmers.length; i++){
        if(farmers[i].id === id){
            farmer = farmers[i];
            break;
        }
    }

    if(!farmer) return;

    var newName = prompt('Editar Nome:', farmer.name);
    if(newName && newName.trim() !== '') farmer.name = newName.trim();

    var newCnpj = prompt('Editar CNPJ (14 números):', farmer.cnpj);
    if(newCnpj && newCnpj.trim().length === 14 && !isNaN(newCnpj)){
        farmer.cnpj = newCnpj.trim();
    }else if(newCnpj){
        alert('CNPJ inválido! Mantendo o original.');
    }

    var newFarmName = prompt('Editar Propriedades:', farmer.farmName);
    if(newFarmName && newFarmName.trim() !== '') farmer.farmName = newFarmName.trim();

    sortFarmersByName();
    renderFarmers();
    saveFarmersToLocalStorage();
}

function renderFarmers(){
    var tbody = document.getElementById('farmersContainer');
    tbody.innerHTML = '';

    var filteredFarmers = farmers;
    if(searchTerm !== ''){
        filteredFarmers = farmers.filter(function(farmer){
            return farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.cnpj.includes(searchTerm);
        });
    }

    updateFarmerStats(filteredFarmers);
    
    if(filteredFarmers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">📭 Nenhum produtor cadastrado</td></tr>';
        return;
    }
    
    for(var i = 0; i < filteredFarmers.length; i++) {
        var farmer = filteredFarmers[i];
        var row = tbody.insertRow();
        
        // Nome
        var cellName = row.insertCell(0);
        cellName.textContent = farmer.name;
        
        // CNPJ (formatado)
        var cellCnpj = row.insertCell(1);
        var cnpjFormatado = farmer.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        cellCnpj.textContent = cnpjFormatado;
        
        // Propriedade
        var cellFarm = row.insertCell(2);
        cellFarm.textContent = farmer.farmName;
        
        // Declaração (checkbox)
        var cellDecl = row.insertCell(3);
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'declaration-checkbox';
        checkbox.checked = farmer.declaration;
        checkbox.onchange = (function(id) {
            return function() { toggleDeclaration(id); };
        })(farmer.id);
        cellDecl.appendChild(checkbox);
        
        // Ações
        var cellActions = row.insertCell(4);
        cellActions.className = 'farmer-actions';
        
        var editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.className = 'edit-farmer';
        editBtn.onclick = (function(id) {
            return function() { editFarmer(id); };
        })(farmer.id);
        
        var deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-farmer';
        deleteBtn.onclick = (function(id) {
            return function() { deleteFarmer(id); };
        })(farmer.id);
        
        cellActions.appendChild(editBtn);
        cellActions.appendChild(deleteBtn);
}
}

function updateFarmerStats(filteredFarmers){
    var total = filteredFarmers.length;
    var pending = 0;
    var completed = 0;

    for(var i = 0; i < filteredFarmers.length; i++){
        if(filteredFarmers[i].declaration){
            completed++;
        } else {
            pending++;
        }
    }

    document.getElementById('totalFarmers').textContent = total;
    document.getElementById('pendingDeclaration').textContent = pending;
    document.getElementById('completedDeclaration').textContent = completed;
}

function saveFarmersToLocalStorage(){
    var farmersJSON = JSON.stringify(farmers);
    localStorage.setItem('produtoresRurais', farmersJSON);
}

function loadFarmersFromLocalStorage(){
    var farmersSaved = localStorage.getItem('produtoresRurais');

    if(farmersSaved){
        farmers = JSON.parse(farmersSaved);
    }else{
        farmers = [];
    }

    sortFarmersByName();
    renderFarmers();
}


function setupTabs(){
    var tabBtns = document.querySelectorAll('.tab-btn');  // ← use querySelectorAll para pegar todos
    
    for(var i = 0; i < tabBtns.length; i++){
        tabBtns[i].addEventListener('click', function() {
            var tabId = this.getAttribute('data-tab');
            
            // Remover active de todos os botões
            for(var j = 0; j < tabBtns.length; j++){
                tabBtns[j].classList.remove('active');
            }
            
            // Adicionar active no clicado
            this.classList.add('active');
            
            // Esconder todos os conteúdos
            document.getElementById('tasksTab').classList.remove('active');
            document.getElementById('farmersTab').classList.remove('active');
            
            // Mostrar o conteúdo selecionado
            if(tabId === 'tasks') {
                document.getElementById('tasksTab').classList.add('active');
            } else {
                document.getElementById('farmersTab').classList.add('active');
                renderFarmers(); // Atualizar ao mostrar a aba
            }
        });
    }
}

let tasks = []; // Array para armazenar as tarefas
let currentFilter = 'all'; // Filtro atual

// 3.1 - Adicionar tarefa
function addTask() {   
   
    let tarefa = task.value.trim();
    let prioridade = priority.value;

    if(tarefa === ''){
        alert('Digite uma tarefa válida');
        return;
    }

    var novaTarefa = {
        id: Date.now(),
        title: tarefa,
        priority: prioridade,
        completed: false
    };

    tasks.push(novaTarefa);

    task.value = '';

    renderTasks();

    saveToLocalStorage();

    console.log('Tarefa adicionada', novaTarefa);
}

// 3.2 - Remover tarefa
function deleteTask(id) {
    var confirmar = confirm('Tem certeza que deseja excluir esta tarefa?');

    if(confirmar === 'false'){
        return;
    }

    var taskAtualizada = tasks.filter(function(tarefa){
        return tarefa.id !== id;
    });

    tasks = taskAtualizada;

    renderTasks();

    saveToLocalStorage();

    console.log('Tarefa removida com sucesso!!');
}

// 3.3 - Editar tarefa
function editTask(id) {
    
    var tarefaEncontrada = null;

    for(var i = 0; i < tasks.length; i++){
        if(tasks[i].id === id){
            tarefaEncontrada = tasks[i];
            break;
        }
    }

    if(!tarefaEncontrada){
        alert("Tarefa não encontrada!!");
        return;
    }

    var novoTitulo = prompt('Editar tarefa:', tarefaEncontrada.title);

    if(novoTitulo === null){
        return;
    }

    if(novoTitulo.trim() === ''){
        alert('O título não pode ficar vazio!');
        return;
    }

    var mensagemPrioridade = 'Editar prioridade:\n';
    mensagemPrioridade += 'Digite: alta, media ou baixa\n';
    mensagemPrioridade += 'Prioridade atual: ' + tarefaEncontrada.priority;

    var novaPrioridade = prompt(mensagemPrioridade, tarefaEncontrada.priority)

    if(novaPrioridade !== null){
        novaPrioridade = novaPrioridade.trim().toLocaleLowerCase();
    
        if(novaPrioridade === 'alta' || novaPrioridade === 'media' || novaPrioridade === 'baixa'){
            tarefaEncontrada.priority = novaPrioridade;
        } else{
            alert('Prioridade inválida! Mantendo a original');
        }
    }

    tarefaEncontrada.title = novoTitulo.trim();

    renderTasks();
    saveToLocalStorage();



}

// 3.5 - Renderizar tarefas na tela
function renderTasks() {
    
    renderTasksWithFilter(); // Chama a versão com filtro
    updateStats(); // Atualiza estatísticas
}

function getPriorityIcon(priority) {
    if(priority === 'alta') return '🔴';
    if(priority === 'media') return '🟡';
    if(priority === 'baixa') return '🟢';
    return '⚪';
}

// 3.6 - Atualizar estatísticas
function updateStats() {
    
    total.textContent = tasks.length;

    var altaCount = 0;
    var mediaCount = 0;
    var baixaCount = 0;
    var completedCount = 0;

    for(var i = 0; i < tasks.length; i++){
        if(tasks[i].priority === 'alta') altaCount++;
        else if(tasks[i].priority === 'media') mediaCount++;
        else if(tasks[i].priority === 'baixa') baixaCount++;

        if(tasks[i].completed) completedCount++;
    }

    // Atualizar na tela
    alta.textContent = altaCount;
    media.textContent = mediaCount;
    baixa.textContent = baixaCount;

    var completedElement = document.getElementById('completedCount');
    if(completedElement) {
        completedElement.textContent = completedCount;
    }
}

var filtroAtual = 'all';

// 3.7 - Configurar filtros
function setupFilters() {
    
    var filtros = document.querySelectorAll('.filter-btn');

    for(var i = 0; i < filtros.length; i++){
        var botao = filtros[i];

        botao.addEventListener('click', function(evento){

            for(var j = 0; j < filtros.length; j++){
                filtros[j].classList.remove('active');
            }

            this.classList.add('active');

            filtroAtual = this.getAttribute('data-filter');

            renderTasksWithFilter();
        })
    }
}

function renderTasksWithFilter() {
    // Filtrar as tarefas baseado no filtro atual
    var tasksFiltradas = [];
    
    if(filtroAtual === 'all') {
    tasksFiltradas = tasks;
} else if(filtroAtual === 'completed') {
    // Filtrar apenas concluídas
    for(var i = 0; i < tasks.length; i++) {
        if(tasks[i].completed === true) {
            tasksFiltradas.push(tasks[i]);
        }
    }
} else if(filtroAtual === 'pending') {
    // Filtrar apenas pendentes
    for(var i = 0; i < tasks.length; i++) {
        if(tasks[i].completed === false) {
            tasksFiltradas.push(tasks[i]);
        }
    }
} else {
    // Filtrar por prioridade
    for(var i = 0; i < tasks.length; i++) {
        if(tasks[i].priority === filtroAtual) {
            tasksFiltradas.push(tasks[i]);
        }
    }
}
    
    // Mostrar as tarefas filtradas
    container.innerHTML = '';
    
    if(tasksFiltradas.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Nenhuma tarefa encontrada neste filtro</div>';
        return;
    }
    
     for(var i = 0; i < tasksFiltradas.length; i++) {
        var tarefa = tasksFiltradas[i];
        var taskDiv = document.createElement('div');
        taskDiv.className = 'task-card';
        taskDiv.setAttribute('data-priority', tarefa.priority);
        taskDiv.setAttribute('data-task-id', tarefa.id);
        
        var textoCompletoClass = tarefa.completed ? 'task-title completed' : 'task-title';
        
        // Adicionar IDs únicos para cada elemento
        taskDiv.innerHTML = `
            <div class="task-content">
                <div class="task-checkbox">
                    <input type="checkbox" 
                           class="task-checkbox-input" 
                           ${tarefa.completed ? 'checked' : ''} 
                           onchange="toggleComplete(${tarefa.id})">
                </div>
                <div class="task-info">
                    <div id="task-title-${tarefa.id}" class="${textoCompletoClass}">${tarefa.title}</div>
                    <span class="task-priority priority-${tarefa.priority}">
                        ${getPriorityIcon(tarefa.priority)} ${tarefa.priority.toUpperCase()}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button id="edit-btn-${tarefa.id}" class="edit-btn" onclick="startEdit(${tarefa.id})">✏️</button>
                <button class="delete-btn" onclick="deleteTask(${tarefa.id})">🗑️</button>
            </div>
        `;
        
        container.appendChild(taskDiv);
    }
}

function toggleComplete(id){

    for(var i = 0; i < tasks.length; i++){
        if(tasks[i].id === id){
            tasks[i].completed = !tasks[i].completed;
            break;
        }
    }

    renderTasks();
    saveToLocalStorage();
}

var tarefaEditandoId = null;

function startEdit(id) {
    if(tarefaEditandoId !== null && tarefaEditandoId !== id) {
        cancelEdit(tarefaEditandoId);
    }
    
    var tarefa = null;
    for(var i = 0; i < tasks.length; i++) {
        if(tasks[i].id === id) {
            tarefa = tasks[i];
            break;
        }
    }
    
    if(!tarefa) return;
    
    // Editar título
    var titleElement = document.getElementById('task-title-' + id);
    var inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = tarefa.title;
    inputElement.className = 'edit-input';
    inputElement.id = 'edit-input-' + id;
    
    titleElement.style.display = 'none';
    titleElement.parentNode.insertBefore(inputElement, titleElement.nextSibling);
    
    // Editar prioridade (adicionar select)
    var prioritySpan = titleElement.parentNode.querySelector('.task-priority');
    var selectElement = document.createElement('select');
    selectElement.className = 'edit-priority';
    selectElement.id = 'edit-priority-' + id;
    selectElement.innerHTML = `
        <option value="alta" ${tarefa.priority === 'alta' ? 'selected' : ''}>🔴 Alta</option>
        <option value="media" ${tarefa.priority === 'media' ? 'selected' : ''}>🟡 Média</option>
        <option value="baixa" ${tarefa.priority === 'baixa' ? 'selected' : ''}>🟢 Baixa</option>
    `;
    
    prioritySpan.style.display = 'none';
    prioritySpan.parentNode.insertBefore(selectElement, prioritySpan.nextSibling);
    
    // Mudar botões
    var editBtn = document.getElementById('edit-btn-' + id);
    editBtn.innerHTML = '💾';
    editBtn.setAttribute('onclick', 'saveEditFull(' + id + ')');
    
    var actionsDiv = editBtn.parentNode;
    var cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '❌';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.setAttribute('onclick', 'cancelEditFull(' + id + ')');
    actionsDiv.appendChild(cancelBtn);
    
    tarefaEditandoId = id;
    
    inputElement.addEventListener('keypress', function(event) {
        if(event.key === 'Enter') {
            saveEditFull(id);
        }
    });
}

function saveEditFull(id) {
    var inputElement = document.getElementById('edit-input-' + id);
    var selectElement = document.getElementById('edit-priority-' + id);
    
    var novoTitulo = inputElement.value.trim();
    var novaPrioridade = selectElement.value;
    
    if(novoTitulo === '') {
        alert('O título não pode ficar vazio!');
        return;
    }
    
    for(var i = 0; i < tasks.length; i++) {
        if(tasks[i].id === id) {
            tasks[i].title = novoTitulo;
            tasks[i].priority = novaPrioridade;
            break;
        }
    }
    
    saveToLocalStorage();
    renderTasks();
    tarefaEditandoId = null;
}

function cancelEditFull(id) {
    // Simplesmente recarregar a tela
    renderTasks();
    tarefaEditandoId = null;
}


// Salvar no localStorage
function saveToLocalStorage() {
    var tasksJSON = JSON.stringify(tasks);

    localStorage.setItem('minhasTarefas', tasksJSON);

    console.log('Tarefas salvas automaticamente');
}

// Carregar do localStorage
function loadFromLocalStorage() {
    
    var tasksSalvas = localStorage.getItem('minhasTarefas');

    if(tasksSalvas){
        tasks = JSON.parse(tasksSalvas);
        console.log('Tarefas carregadas:', tasks);
    } else {
        console.log('Nenhuma tarefa encontrada');
        tasks = [];
    }

    renderTasks();
}

function limparTodasTarefas(){
    if(confirm('⚠️ Tem certeza? Isso vai apagar TODAS as tarefas!')){
        tasks = [];
        saveToLocalStorage();
        renderTasks();
        alert('Todas as tarefas removidas!');
    }
}

var clearBtn = document.getElementById('clearBtn');
if(clearBtn){
    clearBtn.addEventListener('click', limparTodasTarefas);
}




// Chamar init quando a página carregar
// document.addEventListener('DOMContentLoaded', init)
// Remove estas linhas duplicadas:
// loadFromLocalStorage();  ← já está sendo chamada dentro de init()
// btnAdd.addEventListener('click', addTask);  ← já está dentro de init()
// setupFilters();  ← já está dentro de init()

// Mantenha apenas:
function init() {
    loadFromLocalStorage();  // ← ADICIONE ESTA LINHA (estava faltando)
    loadFarmersFromLocalStorage();
    
    btnAdd.addEventListener('click', addTask);
    
    var addFarmerBtn = document.getElementById('addFarmerBtn');
    if(addFarmerBtn) {
        addFarmerBtn.addEventListener('click', addFarmer);
    }
    
    var searchInput = document.getElementById('searchFarmer');
    if(searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value;
            renderFarmers();
        });
    }
    
    var sortBtn = document.getElementById('sortByNameBtn');
    if(sortBtn) {
        sortBtn.addEventListener('click', function() {
            sortFarmersByName();
            renderFarmers();
            saveFarmersToLocalStorage();
        });
    }
    
    setupTabs();
    setupFilters();
}

// Chamar init quando a página carregar
document.addEventListener('DOMContentLoaded', init);