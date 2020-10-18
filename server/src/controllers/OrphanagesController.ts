import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import Orphanage from '../models/Orphanage'
import orphanages_view from '../views/orphanages_view';
import orphanageView from '../views/orphanages_view';
import * as Yup from 'yup';

export default{

	async index(request: Request, response: Response){

		const orphanagesRepository = getRepository(Orphanage);

		const orphanages = await orphanagesRepository.find({
			relations: ['images']
		});

		response.status(200).json(orphanages_view.renderMany(orphanages));

	},
	
	async show(request: Request, response: Response){

		const {id} = request.params;

		const orphanagesRepository = getRepository(Orphanage);

		const orphanage = await orphanagesRepository.findOneOrFail(id,{
			relations: ['images']
		});

		response.status(200).json(orphanages_view.render(orphanage));

	}, 

    async create(request: Request, response: Response){

		const {
			name, 
			latitude, 
			longitude, 
			about, 
			instructions, 
			opening_hours,
			open_on_weekends
		} = request.body;

		const orphanageRepository = getRepository(Orphanage);

		const requestImages = request.files as Express.Multer.File[];
		const images = requestImages.map((i)=>{
			return {path: i.filename}
		})

		const data = {
			name,
			latitude, 
			longitude, 
			about, 
			instructions, 
			opening_hours,
			open_on_weekends: open_on_weekends === 'true',
			images
		}

		const schema = Yup.object().shape({
			name: Yup.string().required(),
			latitude: Yup.number().required(),
			longitude: Yup.number().required(),
			about: Yup.string().required().max(300),
			instructions: Yup.string().required(),
			opening_hours: Yup.string().required(),
			open_on_weekends: Yup.boolean().required(),
			images: Yup.array(
				Yup.object().shape({
					path: Yup.string().required()
				})
			)
		})

		await schema.validate(data,{abortEarly: false});

		const orphanage = orphanageRepository.create(data);

		const oCreated = await orphanageRepository.save(orphanage);

		return response.status(201).json(oCreated);
          
    }

}