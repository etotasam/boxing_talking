<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BoxingMatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'red_boxer_id' => $this->faker->numberBetween(0, 100),
            'blue_boxer_id' => $this->faker->numberBetween(0, 100),
            'match_date' => $this->faker->dateTimeBetween('now', '+3months')->format('Y-m-d'),
            'country' => $this->faker->randomElement(["Japan", "USA", "UK"]),
            'weight' => $this->faker->randomElement(["ヘビー", "ミドル", "ライト", "Sバンタム"]),
            'venue' => $this->faker->randomElement(["両国", "ラスベガス", "ウェンブリー"]),
            'grade' => $this->faker->randomElement(["タイトルマッチ", "10R", "6R"]),
            'count_red' => $this->faker->numberBetween(0, 100),
            'count_blue' => $this->faker->numberBetween(0, 100),
        ];
    }
}
