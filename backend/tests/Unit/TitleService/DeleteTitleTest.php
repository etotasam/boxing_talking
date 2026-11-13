<?php

namespace Tests\Unit\TitleService;

use Tests\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Boxer;
use App\Models\Title;
use App\Services\TitleService;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\WeightDivisionSeeder;
use App\Repositories\TitleRepository;

class DeleteTitleTest extends TestCase
{
    use RefreshDatabase;

    protected $titleRepository;
    protected function setUp(): void
    {

        parent::setUp();
        $this->seed([OrganizationSeeder::class, WeightDivisionSeeder::class]);
        $this->titleRepository = new TitleRepository;

        [$this->redBoxer, $this->blueBoxer] = Boxer::factory()->count(2)->create();

        $this->organization = [
            "WBA" => 1,
            "WBC" => 2,
            "IBF" => 3,
            "WBO" => 4,
        ];

        $this->weight = [
            'heavy' => 1,
            'cruiser' => 2,
            'lightHeavy' => 3,
            'superMiddle' => 4,
        ];

        // 削除対象のタイトルを事前に登録
        $this->titles = Title::create([
            "boxer_id" => $this->redBoxer->id,
            "organization_id" => $this->organization["WBC"],
            "weight_division_id" => $this->weight['superMiddle']
        ]);
    }


    /**
     * titleの削除テスト
     */
    public function testDeleteTitle()
    {
        // ? setUpで登録したタイトルが存在しているかを確認
        $this->assertDatabaseHas('titles', $this->titles->toArray());

        $isDeleted = $this->titleRepository->deleteTitle($this->titles->boxer_id, $this->titles->weight_division_id, $this->titles->organization_id);

        $this->assertTrue($isDeleted);
        $this->assertDatabaseMissing('titles', $this->titles->toArray());
    }

    /** 団体の省略・明示nullは同階級を削除し、別階級・別選手を残す。 */
    #[DataProvider('unspecifiedOrganizations')]
    public function testDeleteTitleWithoutOrganization(bool $omitArgument): void
    {
        $sameWeight = Title::create(['boxer_id' => $this->redBoxer->id, 'weight_division_id' => $this->weight['superMiddle'], 'organization_id' => $this->organization['WBA']]);
        $otherWeight = Title::create(['boxer_id' => $this->redBoxer->id, 'weight_division_id' => $this->weight['heavy'], 'organization_id' => $this->organization['WBC']]);
        $otherBoxer = Title::create(['boxer_id' => $this->blueBoxer->id, 'weight_division_id' => $this->weight['superMiddle'], 'organization_id' => $this->organization['WBC']]);

        $deleted = $omitArgument
            ? $this->titleRepository->deleteTitle($this->redBoxer->id, $this->weight['superMiddle'])
            : $this->titleRepository->deleteTitle($this->redBoxer->id, $this->weight['superMiddle'], null);

        $this->assertTrue($deleted);
        $this->assertDatabaseMissing('titles', $this->titles->toArray());
        $this->assertDatabaseMissing('titles', $sameWeight->toArray());
        $this->assertDatabaseHas('titles', $otherWeight->toArray());
        $this->assertDatabaseHas('titles', $otherBoxer->toArray());
    }

    public static function unspecifiedOrganizations(): array
    {
        return ['omitted' => [true], 'explicit null' => [false]];
    }
}
