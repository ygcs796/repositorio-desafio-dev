import { request, response } from "express";
import * as PlantaRepository from "@repositories/PlantaRepository";
import { Luminosidade } from "@prisma/client";

export const createPlanta = async (req = request, res = response) => {
    try {
        // leitura
        const { nome, especie, preco, 
            estoque, luminosidade, 
            petFriendly, regaACadaDias} = req.body;

        // validação e regras
        if (nome === undefined || especie === undefined || preco === undefined || estoque === undefined || luminosidade === undefined || petFriendly === undefined || regaACadaDias === undefined){
            return res.status(400).json({message: "Todos os campos são obrigatórios"});
        } else if (preco <= 0 || regaACadaDias < 1){
            if (preco <= 0){
                return res.status(400).json({message: "Preço menor ou igual a zero"});
            } else if (regaACadaDias < 1) {
                return res.status(400).json({message: "regaACadaDias menor que 1"});
            }
        } else if (estoque < 0) {
            return res.status(400).json({message: "Estoque menor que zero"});
        } else if (!(Object.values(Luminosidade).includes(luminosidade))) {
            return res.status(400).json({message: "Luminosidade não-reconhecida"});
        } else if (!Number.isInteger(preco)){
            return res.status(400).json({message: "Preço não é um número inteiro"});
        } else if (typeof petFriendly != "boolean"){
            return res.status(400).json({message: "petFriendly não é um booleano"})
        } else if (typeof nome != "string" || typeof especie != "string"){
            return res.status(400).json({message: "O que deveria ser texto não é texto"})
        }
        
        const planta = await PlantaRepository.createPlanta({
            nome: nome,
            especie: especie,
            preco: preco,
            estoque: estoque,
            luminosidade: luminosidade,
            petFriendly: petFriendly,
            regaACadaDias: regaACadaDias
        })
        
        return res.status(201).json(planta);

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erro ao criar planta"})       
    }
}

export const findAllPlantas = async(req = request, res = response) => {
    try {
        const luminosidadeStr = req.query.luminosidade as string | undefined;
        const petFriendlyStr = req.query.petFriendly as string | undefined;

        let luminosidade: Luminosidade | undefined = undefined;
        if (luminosidadeStr !== undefined){
            if (typeof luminosidadeStr !== "string" || !Object.values(Luminosidade).includes(luminosidadeStr as Luminosidade)){
                return res.status(400).json({message: "Luminosidade não-reconhecida"})
            }
            luminosidade = luminosidadeStr as Luminosidade;
        }

        if (petFriendlyStr !== undefined){
            if (!("true, false".includes(petFriendlyStr))){
                return res.status(400).json({message: "petFriendly não é booleano"})
            }
        }

        const petFriendly = petFriendlyStr === undefined? undefined : petFriendlyStr === "true";
        
        const plantas = await PlantaRepository.findAllPlantas(luminosidade, petFriendly);
        return res.status(200).json(plantas);
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Erro ao buscar plantas"})

    }
}

export const findPlantaById = async(req = request, res = response) => {
    try {
        const id = Number(req.params.id)
        if (!(Number.isInteger(id)) || id <= 0) {
            if (!(Number.isInteger(id))){
                return res.status(400).json({message: "ID não inteiro"})
            } else if (id <= 0){
                return res.status(404).json({message: "ID inválido"})
            }
        }

        const planta = await PlantaRepository.findPlantaById(id)

        if (!planta) {
            return res.status(404).json({message: "Planta não encontrada"})
        } 

        return res.status(200).json(planta);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erro ao buscar planta"})
        
    }
}

export const updatePlanta = async(req = request, res = response) => {
    try {
        // leitura
        const id = Number(req.params.id);
        if (!(Number.isInteger(id)) || id <= 0) {
            if (!(Number.isInteger(id))){
                return res.status(400).json({message: "ID não inteiro"})
            } else if (id <= 0){
                return res.status(404).json({message: "ID inválido"})
            }
        }

        const planta = await PlantaRepository.findPlantaById(id)

        if (!planta){
            return res.status(404).json({message: "Usuário não encontrado"})
        }

        const { nome, especie, preco, 
            estoque, luminosidade, 
            petFriendly, regaACadaDias} = req.body;

        // validação e regras
        if (nome != undefined){
            if (typeof nome != "string" || nome.trim() === ""){
                return res.status(400).json({message: "Nome não é string ou está vazio"})
            }
        } else if (especie != undefined){
            if (typeof especie != "string" ){
                return res.status(400).json({message: "Especie não é string"})
            }
        } else if (preco != undefined){
            if (!Number.isInteger(preco) || preco <= 0){
                return res.status(400).json({message: "O preço informado não está correto"})
            }
        } else if (estoque != undefined){
            if (!Number.isInteger(estoque) || estoque < 0){
                return res.status(400).json({message: "O estoque informado não está correto"})
            }
        } else if (luminosidade != undefined){
            if (!Object.values(Luminosidade).includes(luminosidade)){
                return res.status(400).json({message: "Luminosidade não-reconhecida"})
            }
        } else if (petFriendly != undefined){
            if (typeof petFriendly != "boolean"){
                return res.status(400).json({message: "petFriendly não é um booleano"})
            }
        } else if (regaACadaDias != undefined){
            if (!Number.isInteger(regaACadaDias) || regaACadaDias < 1){
                return res.status(400).json({message: "regaACadaDias menor que 1"})
            }
        }
        
        const updatedPlanta = await PlantaRepository.updatePlanta(id, {
            nome: nome,
            especie: especie,
            preco: preco,
            estoque: estoque,
            luminosidade: luminosidade,
            petFriendly: petFriendly,
            regaACadaDias: regaACadaDias
        })
        
        return res.status(200).json(updatedPlanta);

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erro ao atualizar planta"})       
    }
}

export const deletePlanta = async(req = request, res = response) => {
    try {
        const id = Number(req.params.id);
        if (!(Number.isInteger(id)) && id < 0) {
            if (!(Number.isInteger(id))){
                return res.status(400).json({message: "ID não inteiro"})
            } else if (id < 0){
                return res.status(404).json({message: "ID que não existe"})
            }
        }

        const planta = await PlantaRepository.findPlantaById(id)

        if (!planta){
            return res.status(404).json({message: "Usuário não encontrado"})
        }

        const deletedPlanta = await PlantaRepository.deletePlanta(id);

        return res.status(204)
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erro ao deletar planta"});
        
    }
} 

export const diminuirEstoquePlanta = async(req = request, res = response) => {
    try {
        const id = Number(req.params.id);

        if (!(Number.isInteger(id)) || id <= 0) {
            if (!(Number.isInteger(id))){
                return res.status(400).json({message: "ID não inteiro"})
            } else if (id <= 0){
                return res.status(404).json({message: "ID inválido"})
            }
        }

        const { quantidade }  = req.body

        if (!Number.isInteger(quantidade)){
            return res.status(400).json({message: "Quantidade vendida não é um inteiro"})
        } else if (quantidade <= 0){
            return res.status(400).json({message: "Quantidade vendida menor ou igual a zero"})
        }

        const planta = await PlantaRepository.findPlantaById(id)

        if (!planta){
            return res.status(404).json({message: "Planta não encontrada"})
        }

        const { estoque } = planta;

        if (estoque < quantidade){
            return res.status(400).json({message: "Estoque menor do que quantidade vendida"})
        }

        const PlantaDiminuida = await PlantaRepository.diminuirEstoquePlanta(id, quantidade)

        return res.status(200).json({message: PlantaDiminuida})

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erro ao diminuir estoque da planta"});
    }
}

export const valorTotalPlantas = async(req = request, res = response) => {
    try {
        const plantas = await PlantaRepository.valorTotalPlantas()

        const valorTotalEmCentavos = plantas.reduce((soma, p) => soma + (p.preco * p.estoque), 0)
        const totalDeVasos = plantas.reduce((soma, p) => soma + p.estoque, 0)

        return res.status(200).json({ "valorTotalEmCentavos": valorTotalEmCentavos, "totalDeVasos": totalDeVasos })
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erro ao calcular o valor total"});
    }
}