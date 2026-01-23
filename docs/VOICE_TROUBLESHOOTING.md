# 🎤 Guia de Teste - Comando de Voz

## ✅ **Pré-requisitos:**

1. **Navegador compatível:**
   - ✅ Google Chrome
   - ✅ Microsoft Edge
   - ❌ Firefox (não suporta webkitSpeechRecognition)
   - ❌ Safari (suporte limitado)

2. **Permissões:**
   - O navegador vai pedir permissão para usar o microfone
   - Clique em **"Permitir"**

## 🧪 **Como Testar:**

### **Passo 1: Verificar Console**
1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Clique no ícone do microfone 🎤

### **Passo 2: Observar Logs**
Você deve ver:
```
🎤 Iniciando gravação...
✅ Gravação iniciada! Fale agora...
```

### **Passo 3: Falar**
- Fale claramente: *"Qual é o meu saldo?"*
- Aguarde 1-2 segundos

### **Passo 4: Verificar Transcrição**
Deve aparecer:
```
🎤 Transcrição: Qual é o meu saldo?
```

## ❌ **Problemas Comuns:**

### **1. Nada acontece ao clicar no microfone**
**Solução:** Verifique se está usando Chrome ou Edge

### **2. Erro: "not-allowed"**
**Solução:** 
- Clique no ícone de cadeado na barra de endereço
- Permita o uso do microfone
- Recarregue a página (F5)

### **3. Erro: "no-speech"**
**Solução:**
- Fale mais alto
- Aproxime o microfone
- Verifique se o microfone está funcionando (teste em outra aplicação)

### **4. Transcrição errada**
**Solução:**
- Fale mais devagar
- Articule melhor as palavras
- Evite ruído de fundo

## 🔍 **Debug:**

Abra o console e cole:
```javascript
if ('webkitSpeechRecognition' in window) {
  console.log('✅ Speech Recognition suportado!');
} else {
  console.log('❌ Speech Recognition NÃO suportado');
}
```

## 📱 **Alternativa Mobile:**

No celular, use o teclado virtual que já tem botão de microfone integrado.

---

**Última atualização:** 23/01/2026 10:10
