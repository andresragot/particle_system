class Particle
{
    constructor(img)
    {
        this.img = img;
    
        this.img.halfWidth = this.img.width / 2;
        this.img.halfHeight = this.img.height / 2;
    
        this.active = false;
        this.appearing = false;
    
        this.position = new Vector2();
    
        this.opacity = 0.0;
        this.opacityVelocity = 0.0;
    
        this.rotation = 0.0;
        this.rotationVelocity = 0.0;
    
        this.scale = 1.0;
        this.scaleVelocity = 0.0;
    
        this.direction = new Vector2();
    }
    
    Active(initialPosition, opacityVelocity, initialScale, scaleVelocity, initialRotation, rotationVelocity, direction)
    {
        this.initialPosition = initialPosition;
        
        this.opacity = 0;
        this.opacityVelocity = opacityVelocity;
        
        this.initialScale = initialScale;
        this.scaleVelocity = scaleVelocity;

        this.initialRotation = initialRotation;
        this.rotationVelocity = rotationVelocity;

        this.direction = direction;

        this.active = true;
        this.appearing = true;
    }
    
    Update(deltaTime)
    {
        if (this.appearing)
        {
            // Increase the opacity
            this.opacity += this.opacityVelocity * deltaTime;
            if (this.opacity >= 1.0)
            {
                this.opacity = 1.0;
                this.appearing = false;
            }
        }   
        else
        {
            // check if the opacity should decrease
            // if opacity is 0 -> deactivate the particle
            this.opacity -= this.opacityVelocity * deltaTime;
            if (this.opacity <= 0.0)
            {
                this.opacity = 0.0;
                this.active = false;
            }
        }
    
        // Update the particles parameters (scale, rotation, position)
        this.scale += this.scaleVelocity * deltaTime;
        this.rotation += this.rotationVelocity * deltaTime;

        this.position.x += this.direction.x * deltaTime;
        this.position.y += this.direction.y * deltaTime;
    }

    Draw(ctx)
    {
        // set the particle alpha into the ctx globalAlpha
        ctx.globalAlpha = this.opacity;

        // apply the transformation to the context (translate, rotate, scale)
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotate);
        ctx.scale(this.scale, this.scale);

        // draw the image
        ctx.drawImage(this.img, this.img.halfWidth, this.img.halfHeight, this.img.width, this.img.height);
        ctx.restore();

        // don't forget to reset the ctx gloablAlpha 1
        ctx.globalAlpha = 1;
    }

}

var emitterType = {
    point: 0,
    area: 1
}

class ParticleEmitter
{
    constructor(initialPosition, config)
    {
        this.position = initialPosition;

        this.config = config;

        // default values
        this.type = emitterType.point;

        this.MIN_INITIAL_VELOCITY = 200;
        this.MAX_INITIAL_VELOCITY = 500;

        this.MIN_DIRECTION_Y = -0.5;
        this.MAX_DIRECTION_Y = 0.5;

        this.MIN_DIRECTION_X = -0.5;
        this.MAX_DIRECTION_X = 0.5;
    }

    GetSpawnPoint()
    {
        switch(this.type)
        {
            case emitterType.point:
                return Vector2.Copy(this.position);
                break;
            
            case emitterType.area:

                break;
        }
        // return a Vector2 with the position of the next particle
    }

    GetInitialVelocity()
    {
        // return a Vector2 with the direction of the next particle should follow
        let direction = new Vector2(RandomBetweenFloat(this.config.MIN_DIRECTION_X, this.config.MAX_DIRECTION_X), RandomBetweenFloat(this.config.MIN_DIRECTION_Y, this.config.MAX_DIRECTION_X));

        direction.Normalize();
        direction.MultiplyScalar(RandomBetweenFloat(this.config.MIN_INITIAL_VELOCITY, this.config.MAX_INITIAL_VELOCITY));

        return direction;
    }
}

class ParticleSystem
{
    constructor(img, config)
    {
        // in the config parameter there should be the configuration
        // for this particle system
        this.img = img;
        this.config = config;

        //create the emitter
        this.emitter = new ParticleEmitter(Vector2.Zero, this.config);

        // initialize an array of Particle objects 
        this.particles = new Array();

        // initialize the particles pool
        for (let i = 0; i < this.config.maxParticleCount; i++)
        {
            this.particles.push(new Particle(this.img));
        }
        

        // compute the "nextTimeToSpawnParticle" time
        this.nextTimeToSpawnParticle = RandomBetweenFloat(this.config.MIN_TIME_TO_SPAWN_PARTICLE, this.config.MAX_TIME_TO_SPAWN_PARTICLE);
    }

    Update(deltaTime)
    {
        // update the "nextTimeToSpawnParticle" counter
        this.nextTimeToSpawnParticle -= deltaTime;

        // if it is time to spawn a particle -> do it
        if (this.nextTimeToSpawnParticle <= 0.0)
        {
            // compute the new "nextTimeToSpawnParticle" value
            this.nextTimeToSpawnParticle = RandomBetweenFloat(this.config.MIN_TIME_TO_SPAWN_PARTICLE, this.config.MAX_TIME_TO_SPAWN_PARTICLE);

            // activate a new particle
            // look for the first unactive in the pool
            let particle = null;
            for (let i = 0; i < this.particles.length && particle == null; i++)
            {
                if (!this.particles[i].active)   
                    particle = this.particles[i];
            }

            if (particle )
            {
                // set the parameters into the new particle
                const spawnPoint = this.emitter.GetSpawnPoint();

                const opacityVelocity = RandomBetweenFloat(this.config.MIN_OPACITY_DECREMENT_VELOCITY, this.config.MAX_OPACITY_DECREMENT_VELOCITY);

                const initialScale = RandomBetweenFloat(this.config.MIN_INITIAL_SCALE, this.config.MAX_INITIAL_SCALE);

                const scaleVelocity = RandomBetweenFloat(this.config.MIN_SCALE_VELOCITY, this.config.MAX_SCALE_VELOCITY);

                const initialRotation = RandomBetweenFloat(this.config.MIN_INITIAL_ROTATION, this.config.MAX_INITIAL_ROTATION);

                const rotationVelocity = RandomBetweenFloat(this.config.MIN_ROTATION_VELOCITY, this.config.MAX_ROTATION_VELOCITY);

                const direction = this.emitter.GetInitialVelocity();

                particle.Active(spawnPoint, opacityVelocity, initialScale, scaleVelocity, initialRotation, rotationVelocity, direction);
            }
            else
            {
                console.log("Warning: not enough particles in the pool!");
            }

            // set the parameters into the new particle
        }

        // Update all the current activate particles
        this.particles.forEach(particle => {
            if (particle.active)
                particle.Update(deltaTime);
        });

    }

    Draw(ctx)
    {
        // Draw all the current active particles
        this.particles.forEach(particle => {
            if (particle.active)
                particle.Draw(ctx);
        });
    }

}