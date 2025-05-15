document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('referralForm');
    const cpfInput = document.getElementById('cpf');
    const birthDateInput = document.getElementById('birthDate');
    const phoneInput = document.getElementById('phone');

    // Máscara para CPF
    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        }
    });

    // Máscara para data de nascimento
    birthDateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
            e.target.value = value;
        }
    });

    // Máscara para telefone
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });

    // Validação de CPF
    function validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    // Validação de data de nascimento
    function validateBirthDate(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return false;

        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);

        const date = new Date(year, month, day);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 120);

        return date <= today && date >= minDate &&
               date.getDate() === day &&
               date.getMonth() === month &&
               date.getFullYear() === year;
    }

    // Função para formatar a data para o formato aceito pelo backend (YYYY-MM-DD)
    function formatDateForBackend(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Adiciona o modal ao HTML
    const modalHTML = `
        <div id="linkModal" class="modal">
            <div class="modal-content">
                <h3>Seu link de indicação</h3>
                <p>Compartilhe este link com seus amigos:</p>
                <div class="link-container">
                    <input type="text" id="referralLink" readonly>
                    <button id="copyButton">Copiar</button>
                </div>
                <button id="closeModal" class="close-button">Fechar</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Elementos do modal
    const modal = document.getElementById('linkModal');
    const closeModal = document.getElementById('closeModal');
    const copyButton = document.getElementById('copyButton');
    const referralLinkInput = document.getElementById('referralLink');

    // Fecha o modal
    closeModal.onclick = () => {
        modal.style.display = "none";
    };

    // Fecha o modal se clicar fora dele
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Copia o link
    copyButton.onclick = () => {
        referralLinkInput.select();
        document.execCommand('copy');
        copyButton.textContent = 'Copiado!';
        setTimeout(() => {
            copyButton.textContent = 'Copiar';
        }, 2000);
    };

    // Validação do formulário e envio para API
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        // Validar CPF
        if (!validateCPF(cpfInput.value)) {
            document.getElementById('cpf-error').textContent = 'CPF inválido';
            isValid = false;
        } else {
            document.getElementById('cpf-error').textContent = '';
        }

        // Validar data de nascimento
        if (!validateBirthDate(birthDateInput.value)) {
            document.getElementById('birthDate-error').textContent = 'Data de nascimento inválida';
            isValid = false;
        } else {
            document.getElementById('birthDate-error').textContent = '';
        }

        // Validar telefone
        if (phoneInput.value.replace(/\D/g, '').length < 11) {
            document.getElementById('phone-error').textContent = 'Telefone inválido';
            isValid = false;
        } else {
            document.getElementById('phone-error').textContent = '';
        }

        if (isValid) {
            try {
                const formData = {
                    cpf: cpfInput.value.replace(/\D/g, ''),
                    birth_date: formatDateForBackend(birthDateInput.value),
                    phone: phoneInput.value.replace(/\D/g, '')
                };

                const response = await fetch('/referrer/link', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Erro ao gerar link');
                }

                const data = await response.json();

                // Mostra o link no modal
                referralLinkInput.value = data.link;
                modal.style.display = "block";

                // Limpa o formulário
                form.reset();
            } catch (error) {
                console.error('Erro:', error);
                alert('Ocorreu um erro ao gerar o link. Por favor, tente novamente.');
            }
        }
    });
});