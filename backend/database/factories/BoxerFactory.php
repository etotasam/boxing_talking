<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BoxerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'eng_name' => $this->faker->name(),
            'country' => $this->faker->country(),
            'ko' => $this->faker->numberBetween(0, 10),
            'win' => $this->faker->numberBetween(0, 10),
            'draw' => $this->faker->numberBetween(0, 10),
            'lose' => $this->faker->numberBetween(0, 10),
            'birth' => $this->faker->dateTimeBetween('-45 years', '-20 years')->format('Y-m-d'),
            'height' => '180',
            'style' => 'オーソドックス'
        ];
    }
}
