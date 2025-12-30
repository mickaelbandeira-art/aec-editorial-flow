package com.teuprojeto.flowrev.controller;

import com.teuprojeto.flowrev.model.Cartao;
import com.teuprojeto.flowrev.repository.CartaoRepository;
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
}
