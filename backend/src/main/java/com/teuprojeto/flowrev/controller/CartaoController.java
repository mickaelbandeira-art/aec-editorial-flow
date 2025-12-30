package com.teuprojeto.flowrev.controller;

import com.teuprojeto.flowrev.model.Cartao;
import com.teuprojeto.flowrev.repository.CartaoRepository;
import com.teuprojeto.flowrev.model.Anexo;
import com.teuprojeto.flowrev.model.Anexo;
import com.teuprojeto.flowrev.model.Comentario;
import com.teuprojeto.flowrev.repository.AnexoRepository;
import com.teuprojeto.flowrev.repository.ComentarioRepository;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cartoes")
@CrossOrigin(origins = "*") // IMPORTANTE: Permite que o JS aceda sem bloqueio
public class CartaoController {

    @Autowired
    private CartaoRepository cartaoRepository;

    @Autowired
    private AnexoRepository anexoRepository;

    @Autowired
    private ComentarioRepository comentarioRepository;

    // 1. Listar todos os cartões (Para carregar o quadro ao abrir a página)
    @GetMapping
    public List<Cartao> listarTodos() {
        return cartaoRepository.findAll();
    }

    // 2. Criar Novo Cartão (Usado no "Adicionar Rápido")
    @PostMapping
    public Cartao criarCartao(@RequestBody Map<String, String> payload) {
        // O payload vem como: {"titulo": "X", "coluna": "Y"}
        String titulo = payload.get("titulo");
        String coluna = payload.get("coluna");
        
        Cartao novo = new Cartao(titulo, coluna);
        return cartaoRepository.save(novo); // Retorna o objeto COM O ID gerado
    }

    // 3. Mover Cartão (Drag & Drop)
    @PutMapping("/{id}/mover")
    public ResponseEntity<Cartao> moverCartao(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String novaColuna = payload.get("coluna");

        return cartaoRepository.findById(id)
            .map(cartao -> {
                cartao.setColuna(novaColuna);
                Cartao atualizado = cartaoRepository.save(cartao);
                return ResponseEntity.ok(atualizado);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // 4. Atualizar Detalhes (Data, Descrição, etc)
    @PutMapping("/{id}")
    public ResponseEntity<Cartao> atualizarDetalhes(@PathVariable Long id, @RequestBody Cartao dadosNovos) {
        return cartaoRepository.findById(id)
            .map(cartao -> {
                // Atualiza só o que veio preenchido
                if (dadosNovos.getTitulo() != null) cartao.setTitulo(dadosNovos.getTitulo());
                if (dadosNovos.getDescricao() != null) cartao.setDescricao(dadosNovos.getDescricao());
                if (dadosNovos.getDataEntrega() != null) cartao.setDataEntrega(dadosNovos.getDataEntrega());
                if (dadosNovos.getResponsavel() != null) cartao.setResponsavel(dadosNovos.getResponsavel());
                
                Cartao atualizado = cartaoRepository.save(cartao);
                return ResponseEntity.ok(atualizado);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    // 5. Deletar Cartão (Opcional, mas útil)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCartao(@PathVariable Long id) {
        if (cartaoRepository.existsById(id)) {
            cartaoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 6. UPLOAD DE ANEXOS (Novo)
    @PostMapping("/{cardId}/anexos")
    public ResponseEntity<Anexo> uploadAnexo(@PathVariable Long cardId, @RequestParam("file") MultipartFile file) {
        try {
            // 1. Validações básicas
            if (file.isEmpty()) return ResponseEntity.badRequest().build();

            // 2. Define onde salvar (Pasta "uploads" na raiz do projeto)
            String pastaUploads = "uploads/";
            Files.createDirectories(Paths.get(pastaUploads)); // Cria a pasta se não existir

            // 3. Gera nome único
            String nomeOriginal = file.getOriginalFilename();
            String nomeArquivoFisico = UUID.randomUUID().toString() + "_" + nomeOriginal;
            Path caminhoFinal = Paths.get(pastaUploads + nomeArquivoFisico);

            // 4. COPIA O ARQUIVO (Rápido!)
            Files.copy(file.getInputStream(), caminhoFinal, StandardCopyOption.REPLACE_EXISTING);

            // 5. Salva os metadados no Banco
            Cartao cartao = cartaoRepository.findById(cardId).orElseThrow();
            
            Anexo anexo = new Anexo();
            anexo.setNomeArquivo(nomeOriginal);
            anexo.setCaminhoNoDisco(caminhoFinal.toString());
            // URL fictícia de download (Assume que você vai criar um endpoint GET /files ou configurar estático)
            anexo.setUrlPublica("http://localhost:8080/files/" + nomeArquivoFisico); 
            anexo.setCartao(cartao);
            
            anexoRepository.save(anexo);

            return ResponseEntity.ok(anexo);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 7. COMENTÁRIOS (Chat)
    // 1. SALVAR MENSAGEM
    @PostMapping("/{id}/comentarios")
    public ResponseEntity<Comentario> adicionarComentario(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String texto = payload.get("texto");
        String autor = payload.get("autor"); // Ou pega da sessão

        return cartaoRepository.findById(id).map(cartao -> {
            Comentario comentario = new Comentario(texto, autor, cartao);
            return ResponseEntity.ok(comentarioRepository.save(comentario));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 2. LISTAR MENSAGENS DE UM CARTÃO (Para atualização automática)
    @GetMapping("/{id}/comentarios")
    public ResponseEntity<List<Comentario>> listarComentarios(@PathVariable Long id) {
        List<Comentario> comentarios = comentarioRepository.findByCartaoId(id);
        return ResponseEntity.ok(comentarios);
    }
}
